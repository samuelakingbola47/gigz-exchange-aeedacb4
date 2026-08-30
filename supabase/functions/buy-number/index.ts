// ============================================================================
// buy-number Edge Function
//
// What this does, step by step, every time a logged-in user requests a
// number:
//   1. Verifies who's calling (using their login token - never trusts a
//      user id sent in the request body, since that could be faked).
//   2. Looks up the country/service they asked for, and gets 5sim's naming
//      for them (provider_country_slug / provider_service_code).
//   3. Asks 5sim for a live price quote (no money spent yet).
//   4. Converts that price to Naira using your app_settings (exchange
//      rate x markup).
//   5. Checks the user's wallet has enough balance - stops here if not,
//      BEFORE any real money is spent on 5sim.
//   6. Buys the real number from 5sim (this is the point real $ leaves
//      your 5sim account).
//   7. Charges the wallet and creates the order via purchase_real_number
//      (the tested, atomic function from before).
//   8. Safety net: if step 7 fails for any reason after step 6 already
//      succeeded, automatically cancels the 5sim number so you get
//      refunded rather than losing money for nothing.
//
// This function runs entirely on the server - the 5sim API key never
// reaches the browser, and nothing here can be called by an anonymous
// visitor (step 1 requires a valid logged-in session).
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIVESIM_BASE = 'https://5sim.net/v1';

Deno.serve(async (req: Request) => {
  // Browsers send a preflight OPTIONS request before the real one - just
  // acknowledge it so the real request is allowed through.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Set up two Supabase clients ---------------------------------
    // One using the SERVICE ROLE key: full trusted access to the
    // database, used for everything except identity verification.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // One using the caller's own login token: used ONLY to safely find
    // out who is actually calling this function.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }
    const supabaseAsUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await supabaseAsUser.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }
    const userId = userData.user.id;

    // --- Read what the user is asking for ----------------------------
    const body = await req.json().catch(() => ({}));
    const countryCode = (body.country_code || '').toLowerCase();
    const serviceCode = (body.service_code || '').toLowerCase();
    if (!countryCode || !serviceCode) {
      return jsonResponse({ error: 'country_code and service_code are required' }, 400);
    }

    // --- Look up our internal country/service rows -------------------
    const { data: country } = await supabaseAdmin
      .from('countries')
      .select('name, country_code, provider_country_slug, status')
      .eq('country_code', countryCode)
      .maybeSingle();

    const { data: service } = await supabaseAdmin
      .from('services')
      .select('name, code, provider_service_code, status')
      .eq('code', serviceCode)
      .maybeSingle();

    if (!country || country.status !== 'active') {
      return jsonResponse({ error: 'Country not available' }, 400);
    }
    if (!service || service.status !== 'active') {
      return jsonResponse({ error: 'Service not available' }, 400);
    }
    if (!country.provider_country_slug || !service.provider_service_code) {
      return jsonResponse({ error: 'This country/service is not yet configured for real purchases' }, 400);
    }

    // --- Read pricing settings -----------------------------------------
    const { data: settingsRows } = await supabaseAdmin
      .from('app_settings')
      .select('key, value')
      .in('key', ['usd_to_ngn_rate', 'default_markup_percent']);

    const settings: Record<string, string> = {};
    for (const row of settingsRows ?? []) settings[row.key] = row.value;
    const usdToNgn = parseFloat(settings.usd_to_ngn_rate ?? '0');
    const markup = parseFloat(settings.default_markup_percent ?? '0');
    if (!usdToNgn || usdToNgn <= 0) {
      return jsonResponse({ error: 'Pricing is not configured correctly' }, 500);
    }

    const fivesimKey = Deno.env.get('FIVESIM_API_KEY');
    if (!fivesimKey) {
      return jsonResponse({ error: 'SMS provider is not configured' }, 500);
    }
    const fivesimHeaders = {
      Authorization: `Bearer ${fivesimKey}`,
      Accept: 'application/json',
    };

    // --- Step 1: get a live quote (no money spent yet) ------------------
    const quoteRes = await fetch(
      `${FIVESIM_BASE}/guest/prices?country=${country.provider_country_slug}&product=${service.provider_service_code}`,
      { headers: { Accept: 'application/json' } },
    );
    const quoteJson = await quoteRes.json().catch(() => null);
    const operators = quoteJson?.[country.provider_country_slug]?.[service.provider_service_code];
    if (!operators) {
      return jsonResponse({ error: 'No numbers currently available for this country/service' }, 400);
    }
    const available = Object.values(operators as Record<string, { cost: number; count: number }>)
      .filter((o) => o.count > 0);
    if (available.length === 0) {
      return jsonResponse({ error: 'No numbers currently in stock' }, 400);
    }
    const cheapestUsd = Math.min(...available.map((o) => o.cost));
    const quotedNgn = Math.ceil(cheapestUsd * usdToNgn * (1 + markup));

    // --- Step 2: check wallet BEFORE spending real money on 5sim --------
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (!wallet) {
      return jsonResponse({ error: 'Wallet not found' }, 400);
    }
    if (wallet.balance < quotedNgn) {
      return jsonResponse({ error: 'Insufficient wallet balance', required: quotedNgn, balance: wallet.balance }, 400);
    }

    // --- Step 3: actually buy the number from 5sim ----------------------
    const buyRes = await fetch(
      `${FIVESIM_BASE}/user/buy/activation/${country.provider_country_slug}/any/${service.provider_service_code}`,
      { headers: fivesimHeaders },
    );
    const buyJson = await buyRes.json().catch(() => null);

    if (!buyRes.ok || !buyJson?.id || !buyJson?.phone) {
      const providerMessage = typeof buyJson === 'string' ? buyJson : (buyJson?.message ?? 'Purchase failed at provider');
      return jsonResponse({ error: `Provider error: ${providerMessage}` }, 502);
    }

    // Use the REAL price 5sim actually charged, not just our earlier quote
    // (operator "any" can land on a slightly different price/operator).
    const finalNgn = Math.ceil(buyJson.price * usdToNgn * (1 + markup));

    // --- Step 4: charge wallet + create order, atomically ---------------
    const { data: order, error: purchaseError } = await supabaseAdmin.rpc('purchase_real_number', {
      _user_id: userId,
      _country_name: country.name,
      _country_code: country.country_code,
      _service_name: service.name,
      _service_code: service.code,
      _phone_number: buyJson.phone,
      _price_ngn: finalNgn,
      _provider_reference: String(buyJson.id),
      _expires_at: buyJson.expires,
    });

    if (purchaseError) {
      // Safety net: we already spent real money on 5sim but couldn't
      // charge the wallet (e.g. a race condition). Cancel the 5sim order
      // so it isn't wasted, then surface the error.
      await fetch(`${FIVESIM_BASE}/user/cancel/${buyJson.id}`, { headers: fivesimHeaders }).catch(() => {});
      return jsonResponse({ error: purchaseError.message }, 400);
    }

    return jsonResponse({ order }, 200);
  } catch (err) {
    console.error('buy-number error:', err);
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
