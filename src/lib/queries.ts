import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuthUser } from "@/lib/auth";

export type Order = Tables<"orders">;
export type WalletRow = Tables<"wallets">;
export type TransactionRow = Tables<"wallet_transactions">;
export type ServiceRow = Tables<"services">;
export type CountryRow = Tables<"countries">;
export type TicketRow = Tables<"support_tickets">;
export type TicketMessageRow = Tables<"support_messages">;

/* ---------------- Public catalog (anon readable) ---------------- */

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return data as ServiceRow[];
    },
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("countries").select("*").order("name");
      if (error) throw error;
      return data as CountryRow[];
    },
  });
}

/* ---------------- Customer data ---------------- */

export function useWallet() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["wallet", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as WalletRow | null;
    },
  });
}

export function useOrders(statuses?: string[]) {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["orders", user?.id, statuses?.join(",") ?? "all"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      let q = supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (statuses?.length) q = q.in("status", statuses);
      const { data, error } = await q;
      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useTransactions(limit?: number) {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["transactions", user?.id, limit ?? "all"],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      let q = supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data as TransactionRow[];
    },
  });
}

export function useTickets() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["tickets", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as TicketRow[];
    },
  });
}

export function useTicketMessages(ticketId?: string | null) {
  return useQuery({
    queryKey: ["ticket-messages", ticketId],
    enabled: Boolean(ticketId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId!)
        .order("created_at");
      if (error) throw error;
      return data as TicketMessageRow[];
    },
  });
}

/* ---------------- Mutations ---------------- */

export function useBuyNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { countryCode: string; serviceCode: string }) => {
      const { data, error } = await supabase.rpc("purchase_demo_number", {
        _country_code: input.countryCode,
        _service_code: input.serviceCode,
      });
      if (error) throw error;
      return data as unknown as Order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.rpc("cancel_demo_order", { _order_id: orderId });
      if (error) throw error;
      return data as unknown as Order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  const { user } = useAuthUser();
  return useMutation({
    mutationFn: async (input: { subject: string; category: string; priority: string; message: string }) => {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({ ...input, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      const { error: msgError } = await supabase.from("support_messages").insert({
        ticket_id: data.id,
        user_id: user!.id,
        message: input.message,
      });
      if (msgError) throw msgError;
      return data as TicketRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}

export function useReplyToTicket() {
  const qc = useQueryClient();
  const { user } = useAuthUser();
  return useMutation({
    mutationFn: async (input: { ticketId: string; message: string }) => {
      const { error } = await supabase.from("support_messages").insert({
        ticket_id: input.ticketId,
        user_id: user!.id,
        message: input.message,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["ticket-messages", v.ticketId] }),
  });
}

/* ---------------- Admin data (RLS: admins see everything) ---------------- */

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useAdminProfiles() {
  return useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Tables<"profiles">[];
    },
  });
}

export function useAdminTransactions() {
  return useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as TransactionRow[];
    },
  });
}

export function useAdminTickets() {
  return useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as TicketRow[];
    },
  });
}
