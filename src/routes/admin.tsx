import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("email_verified")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile?.email_verified) {
      throw redirect({ to: "/verify-email", search: { email: data.user.email ?? undefined } });
    }

    // Role is verified in the database (security definer function) — never trusted from the client.
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw redirect({ to: "/dashboard" });

    return { user: data.user };
  },
  component: () => <Outlet />,
});
