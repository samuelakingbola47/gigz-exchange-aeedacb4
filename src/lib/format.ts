export const orderStatusLabels: Record<string, string> = {
  waiting: "Waiting",
  sms_received: "SMS Received",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};

export function orderStatusLabel(status: string) {
  return orderStatusLabels[status] ?? status;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

export function countdown(expiresAt?: string | null) {
  if (!expiresAt) return "—";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
