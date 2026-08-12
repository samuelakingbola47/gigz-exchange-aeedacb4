// PHASE 1 PROTOTYPE — all data below is placeholder/demo data only.

export type Availability = "high" | "medium" | "low";

export type Service = {
  id: string;
  name: string;
  category: "Messaging" | "Social" | "Tech" | "Finance" | "Marketplace";
  price: number;
  availability: Availability;
  numbers: number;
  emoji: string;
};

export const services: Service[] = [
  { id: "whatsapp", name: "WhatsApp", category: "Messaging", price: 0.42, availability: "high", numbers: 18450, emoji: "🟢" },
  { id: "telegram", name: "Telegram", category: "Messaging", price: 0.38, availability: "high", numbers: 15220, emoji: "🔵" },
  { id: "google", name: "Google", category: "Tech", price: 0.55, availability: "high", numbers: 21030, emoji: "🔴" },
  { id: "facebook", name: "Facebook", category: "Social", price: 0.31, availability: "medium", numbers: 8940, emoji: "🔷" },
  { id: "instagram", name: "Instagram", category: "Social", price: 0.36, availability: "high", numbers: 12310, emoji: "🟣" },
  { id: "tiktok", name: "TikTok", category: "Social", price: 0.29, availability: "medium", numbers: 6720, emoji: "⚫" },
  { id: "x", name: "X", category: "Social", price: 0.34, availability: "low", numbers: 1840, emoji: "✖️" },
  { id: "microsoft", name: "Microsoft", category: "Tech", price: 0.48, availability: "medium", numbers: 5410, emoji: "🟦" },
  { id: "discord", name: "Discord", category: "Messaging", price: 0.27, availability: "high", numbers: 9980, emoji: "🟪" },
  { id: "amazon", name: "Amazon", category: "Marketplace", price: 0.52, availability: "medium", numbers: 4310, emoji: "🟧" },
  { id: "paypal", name: "PayPal", category: "Finance", price: 0.74, availability: "low", numbers: 980, emoji: "🔹" },
  { id: "revolut", name: "Revolut", category: "Finance", price: 0.81, availability: "low", numbers: 640, emoji: "⬛" },
];

export type Country = {
  id: string;
  name: string;
  flag: string;
  dial: string;
  region: "Americas" | "Europe" | "Africa" | "Asia" | "Oceania";
  price: number;
  numbers: number;
  availability: Availability;
};

export const countries: Country[] = [
  { id: "us", name: "United States", flag: "🇺🇸", dial: "+1", region: "Americas", price: 0.45, numbers: 24800, availability: "high" },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", dial: "+44", region: "Europe", price: 0.52, numbers: 15600, availability: "high" },
  { id: "ca", name: "Canada", flag: "🇨🇦", dial: "+1", region: "Americas", price: 0.49, numbers: 9700, availability: "medium" },
  { id: "ng", name: "Nigeria", flag: "🇳🇬", dial: "+234", region: "Africa", price: 0.21, numbers: 31200, availability: "high" },
  { id: "de", name: "Germany", flag: "🇩🇪", dial: "+49", region: "Europe", price: 0.58, numbers: 8100, availability: "medium" },
  { id: "fr", name: "France", flag: "🇫🇷", dial: "+33", region: "Europe", price: 0.54, numbers: 7400, availability: "medium" },
  { id: "au", name: "Australia", flag: "🇦🇺", dial: "+61", region: "Oceania", price: 0.61, numbers: 3900, availability: "low" },
  { id: "nl", name: "Netherlands", flag: "🇳🇱", dial: "+31", region: "Europe", price: 0.5, numbers: 5200, availability: "medium" },
  { id: "in", name: "India", flag: "🇮🇳", dial: "+91", region: "Asia", price: 0.18, numbers: 42600, availability: "high" },
  { id: "za", name: "South Africa", flag: "🇿🇦", dial: "+27", region: "Africa", price: 0.24, numbers: 11400, availability: "high" },
  { id: "br", name: "Brazil", flag: "🇧🇷", dial: "+55", region: "Americas", price: 0.27, numbers: 18900, availability: "high" },
  { id: "id", name: "Indonesia", flag: "🇮🇩", dial: "+62", region: "Asia", price: 0.19, numbers: 22700, availability: "high" },
];

export type OrderStatus = "waiting" | "sms_received" | "completed" | "expired" | "cancelled";

export type Order = {
  id: string;
  country: string;
  flag: string;
  service: string;
  number: string;
  price: number;
  status: OrderStatus;
  created: string;
  expires: string;
  code?: string;
};

export const orders: Order[] = [
  { id: "GX-90412", country: "United States", flag: "🇺🇸", service: "WhatsApp", number: "+1 415 555 0182", price: 0.45, status: "waiting", created: "2026-08-12 14:02", expires: "14:22", },
  { id: "GX-90408", country: "Nigeria", flag: "🇳🇬", service: "Telegram", number: "+234 803 555 0119", price: 0.21, status: "sms_received", created: "2026-08-12 13:41", expires: "14:01", code: "834512" },
  { id: "GX-90391", country: "United Kingdom", flag: "🇬🇧", service: "Google", number: "+44 7700 900412", price: 0.52, status: "completed", created: "2026-08-12 11:18", expires: "—", code: "220481" },
  { id: "GX-90377", country: "India", flag: "🇮🇳", service: "Instagram", number: "+91 98200 55031", price: 0.18, status: "completed", created: "2026-08-11 22:05", expires: "—", code: "771294" },
  { id: "GX-90352", country: "Germany", flag: "🇩🇪", service: "Discord", number: "+49 1520 5550142", price: 0.58, status: "expired", created: "2026-08-11 18:44", expires: "—" },
  { id: "GX-90338", country: "Brazil", flag: "🇧🇷", service: "TikTok", number: "+55 11 95555 0193", price: 0.27, status: "cancelled", created: "2026-08-11 16:12", expires: "—" },
  { id: "GX-90310", country: "Canada", flag: "🇨🇦", service: "Facebook", number: "+1 604 555 0177", price: 0.49, status: "completed", created: "2026-08-10 09:30", expires: "—", code: "551209" },
  { id: "GX-90288", country: "South Africa", flag: "🇿🇦", service: "Microsoft", number: "+27 82 555 0164", price: 0.24, status: "completed", created: "2026-08-09 20:11", expires: "—", code: "409183" },
  { id: "GX-90265", country: "France", flag: "🇫🇷", service: "X", number: "+33 6 55 55 01 22", price: 0.54, status: "completed", created: "2026-08-09 12:47", expires: "—", code: "118743" },
  { id: "GX-90241", country: "Netherlands", flag: "🇳🇱", service: "WhatsApp", number: "+31 6 5555 0138", price: 0.5, status: "expired", created: "2026-08-08 15:03", expires: "—" },
  { id: "GX-90233", country: "India", flag: "🇮🇳", service: "Amazon", number: "+91 98110 55024", price: 0.18, status: "completed", created: "2026-08-08 10:22", expires: "—", code: "662017" },
  { id: "GX-90210", country: "United States", flag: "🇺🇸", service: "Google", number: "+1 212 555 0146", price: 0.45, status: "completed", created: "2026-08-07 19:58", expires: "—", code: "930277" },
];

export type TxType = "Deposit" | "Purchase" | "Refund";

export type Transaction = {
  id: string;
  date: string;
  type: TxType;
  description: string;
  amount: number;
  balance: number;
  status: "Completed" | "Pending" | "Failed";
};

export const transactions: Transaction[] = [
  { id: "TX-55810", date: "2026-08-12 14:02", type: "Purchase", description: "WhatsApp · United States", amount: -0.45, balance: 128.34, status: "Completed" },
  { id: "TX-55804", date: "2026-08-12 13:41", type: "Purchase", description: "Telegram · Nigeria", amount: -0.21, balance: 128.79, status: "Completed" },
  { id: "TX-55790", date: "2026-08-12 09:15", type: "Deposit", description: "Demo card ending 4242", amount: 50.0, balance: 129.0, status: "Completed" },
  { id: "TX-55771", date: "2026-08-11 18:44", type: "Refund", description: "Expired order GX-90352", amount: 0.58, balance: 79.0, status: "Completed" },
  { id: "TX-55764", date: "2026-08-11 16:12", type: "Refund", description: "Cancelled order GX-90338", amount: 0.27, balance: 78.42, status: "Completed" },
  { id: "TX-55702", date: "2026-08-10 08:04", type: "Deposit", description: "Demo bank transfer", amount: 75.0, balance: 78.15, status: "Completed" },
  { id: "TX-55688", date: "2026-08-09 20:11", type: "Purchase", description: "Microsoft · South Africa", amount: -0.24, balance: 3.15, status: "Completed" },
  { id: "TX-55670", date: "2026-08-09 12:47", type: "Purchase", description: "X · France", amount: -0.54, balance: 3.39, status: "Completed" },
  { id: "TX-55651", date: "2026-08-08 11:02", type: "Deposit", description: "Demo wallet top-up", amount: 20.0, balance: 3.93, status: "Pending" },
];

export type Ticket = {
  id: string;
  subject: string;
  category: "Billing" | "Orders" | "Technical" | "API" | "Other";
  priority: "Low" | "Normal" | "High";
  status: "Open" | "Pending" | "Resolved";
  updated: string;
  messages: { from: "You" | "Support"; at: string; body: string }[];
};

export const tickets: Ticket[] = [
  {
    id: "TCK-2081",
    subject: "SMS not received for order GX-90412",
    category: "Orders",
    priority: "High",
    status: "Open",
    updated: "2026-08-12 14:10",
    messages: [
      { from: "You", at: "14:04", body: "I purchased a US number for WhatsApp but no code has arrived yet." },
      { from: "Support", at: "14:10", body: "Thanks for reaching out — we're checking the route for this number now." },
    ],
  },
  {
    id: "TCK-2074",
    subject: "Invoice for July usage",
    category: "Billing",
    priority: "Normal",
    status: "Pending",
    updated: "2026-08-11 10:22",
    messages: [{ from: "You", at: "10:22", body: "Could you send a consolidated invoice for July?" }],
  },
  {
    id: "TCK-2065",
    subject: "API key rotation question",
    category: "API",
    priority: "Low",
    status: "Resolved",
    updated: "2026-08-08 17:35",
    messages: [
      { from: "You", at: "17:20", body: "Does rotating a key invalidate active orders?" },
      { from: "Support", at: "17:35", body: "No — active orders continue until they expire." },
    ],
  },
];

export const revenueSeries = [
  { month: "Feb", revenue: 18400, orders: 21400 },
  { month: "Mar", revenue: 21250, orders: 24800 },
  { month: "Apr", revenue: 19800, orders: 23100 },
  { month: "May", revenue: 26400, orders: 29900 },
  { month: "Jun", revenue: 30100, orders: 33800 },
  { month: "Jul", revenue: 34750, orders: 38200 },
  { month: "Aug", revenue: 39900, orders: 42600 },
];

export const userGrowth = [
  { month: "Feb", users: 4100 },
  { month: "Mar", users: 4900 },
  { month: "Apr", users: 5800 },
  { month: "May", users: 7100 },
  { month: "Jun", users: 8300 },
  { month: "Jul", users: 9400 },
  { month: "Aug", users: 10820 },
];

export const adminUsers = [
  { id: "U-10241", name: "Ada Okafor", email: "ada.okafor@example.com", status: "Active", balance: 128.34, orders: 412, joined: "2025-11-02" },
  { id: "U-10233", name: "Marcus Bell", email: "m.bell@example.com", status: "Active", balance: 42.1, orders: 96, joined: "2026-01-18" },
  { id: "U-10228", name: "Sofia Almeida", email: "sofia.a@example.com", status: "Suspended", balance: 0.0, orders: 31, joined: "2026-02-04" },
  { id: "U-10219", name: "Kenji Watanabe", email: "kenji.w@example.com", status: "Active", balance: 310.5, orders: 1204, joined: "2025-08-27" },
  { id: "U-10204", name: "Lena Fischer", email: "lena.fischer@example.com", status: "Pending", balance: 5.0, orders: 2, joined: "2026-08-09" },
  { id: "U-10188", name: "Tunde Bakare", email: "tunde.b@example.com", status: "Active", balance: 88.9, orders: 240, joined: "2025-12-15" },
];

export const apiProviders = [
  { id: "PRV-01", name: "Provider Alpha", status: "Not connected", countries: 42, services: 180, priority: 1 },
  { id: "PRV-02", name: "Provider Beta", status: "Not connected", countries: 28, services: 120, priority: 2 },
  { id: "PRV-03", name: "Provider Gamma", status: "Not connected", countries: 55, services: 260, priority: 3 },
];

export const loginActivity = [
  { device: "Chrome · macOS", location: "Lagos, NG", ip: "102.89.xx.xx", at: "2026-08-12 13:58", current: true },
  { device: "Safari · iPhone", location: "Lagos, NG", ip: "102.89.xx.xx", at: "2026-08-11 21:12", current: false },
  { device: "Firefox · Windows", location: "London, UK", ip: "81.２0.xx.xx", at: "2026-08-08 09:40", current: false },
];

export const statusLabels: Record<OrderStatus, string> = {
  waiting: "Waiting",
  sms_received: "SMS Received",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};
