export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export type PaymentMethod = "cash" | "khalti" | "esewa" | "fonepay";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type StaffRole = "owner" | "manager" | "chef" | "waiter" | "cashier";

export type TableStatus = "available" | "occupied" | "reserved";

export type WifiEncryption = "WPA" | "WPA2" | "WEP" | "nopass";

export type Locale = "en" | "ne";
