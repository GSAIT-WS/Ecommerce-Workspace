import breakfastImage from "@/assets/trending-breakfast.jpg";
import milletImage from "@/assets/trending-millet.jpg";
import ragiImage from "@/assets/trending-ragi.jpg";
import sugarfreeImage from "@/assets/trending-sugarfree.jpg";

export type OrderStatus = "Processing" | "Packed" | "Shipped" | "Delivered";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  date: string;
  customer: string;
  email: string;
  items: string;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  tracking: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "stock" | "order";
}

export const adminProducts: AdminProduct[] = [
  { id: "PRD-101", name: "Almond Millet Muesli", category: "Breakfast", price: 349, stock: 24, image: breakfastImage },
  { id: "PRD-102", name: "Classic Millet Crunch", category: "Millet Snacks", price: 199, stock: 8, image: milletImage },
  { id: "PRD-103", name: "Ragi Energy Bites", category: "Protein Snacks", price: 249, stock: 5, image: ragiImage },
  { id: "PRD-104", name: "No Added Sugar Cookies", category: "Healthy Foods", price: 229, stock: 42, image: sugarfreeImage },
  { id: "PRD-105", name: "Roasted Seed Mix", category: "Healthy Foods", price: 179, stock: 16, image: milletImage },
  { id: "PRD-106", name: "Cocoa Oat Bar Pack", category: "Protein Snacks", price: 299, stock: 3, image: ragiImage },
];

export const adminOrders: AdminOrder[] = [
  { id: "PV-26018", date: "Oct 22, 2026", customer: "Aarav Mehta", email: "aarav.demo@example.com", items: "Almond Millet Muesli × 2", total: 698, paymentStatus: "Paid", status: "Processing", tracking: "Tracking will be available once this order ships." },
  { id: "PV-26017", date: "Oct 22, 2026", customer: "Diya Kapoor", email: "diya.demo@example.com", items: "Ragi Energy Bites × 1, Seed Mix × 1", total: 428, paymentStatus: "Paid", status: "Packed", tracking: "Tracking will be available once this order ships." },
  { id: "PV-26016", date: "Oct 21, 2026", customer: "Kabir Shah", email: "kabir.demo@example.com", items: "Classic Millet Crunch × 3", total: 597, paymentStatus: "Paid", status: "Shipped", tracking: "Demo carrier · Sample tracking ID PVTRK26016" },
  { id: "PV-26015", date: "Oct 20, 2026", customer: "Mira Nair", email: "mira.demo@example.com", items: "No Added Sugar Cookies × 2", total: 458, paymentStatus: "Pending", status: "Processing", tracking: "Tracking will be available once this order ships." },
  { id: "PV-26014", date: "Oct 19, 2026", customer: "Ishaan Rao", email: "ishaan.demo@example.com", items: "Cocoa Oat Bar Pack × 2", total: 598, paymentStatus: "Paid", status: "Delivered", tracking: "Demo delivery completed Oct 21, 2026." },
  { id: "PV-26013", date: "Oct 18, 2026", customer: "Anaya Bose", email: "anaya.demo@example.com", items: "Almond Millet Muesli × 1", total: 349, paymentStatus: "Paid", status: "Delivered", tracking: "Demo delivery completed Oct 20, 2026." },
];

export const adminCustomers = [
  { id: "CUS-101", name: "Aarav Mehta", email: "aarav.demo@example.com", orders: 8, spent: 4260, city: "Pune" },
  { id: "CUS-102", name: "Diya Kapoor", email: "diya.demo@example.com", orders: 5, spent: 2890, city: "Mumbai" },
  { id: "CUS-103", name: "Kabir Shah", email: "kabir.demo@example.com", orders: 12, spent: 6380, city: "Ahmedabad" },
  { id: "CUS-104", name: "Mira Nair", email: "mira.demo@example.com", orders: 3, spent: 1240, city: "Bengaluru" },
  { id: "CUS-105", name: "Ishaan Rao", email: "ishaan.demo@example.com", orders: 7, spent: 3710, city: "Hyderabad" },
];

export const adminPayments = [
  { id: "TXN-8901", orderId: "PV-26018", amount: 698, date: "Oct 22, 2026", status: "Paid" as PaymentStatus, method: "Card ···· 4242" },
  { id: "TXN-8900", orderId: "PV-26017", amount: 428, date: "Oct 22, 2026", status: "Paid" as PaymentStatus, method: "UPI · demo" },
  { id: "TXN-8899", orderId: "PV-26016", amount: 597, date: "Oct 21, 2026", status: "Paid" as PaymentStatus, method: "Card ···· 1088" },
  { id: "TXN-8898", orderId: "PV-26015", amount: 458, date: "Oct 20, 2026", status: "Pending" as PaymentStatus, method: "Card · demo" },
  { id: "TXN-8897", orderId: "PV-26014", amount: 598, date: "Oct 19, 2026", status: "Paid" as PaymentStatus, method: "UPI · demo" },
  { id: "TXN-8896", orderId: "PV-26013", amount: 349, date: "Oct 18, 2026", status: "Paid" as PaymentStatus, method: "Card ···· 7712" },
];

export const adminNotifications: AdminNotification[] = [
  { id: "NTF-01", title: "Stock running low", message: "Cocoa Oat Bar Pack has only 3 units remaining.", time: "10 minutes ago", read: false, type: "stock" },
  { id: "NTF-02", title: "New demo order", message: "Order PV-26018 was placed for ₹698.", time: "42 minutes ago", read: false, type: "order" },
  { id: "NTF-03", title: "Stock running low", message: "Ragi Energy Bites has only 5 units remaining.", time: "2 hours ago", read: false, type: "stock" },
  { id: "NTF-04", title: "Order delivered", message: "Demo order PV-26014 was marked delivered.", time: "Yesterday", read: true, type: "order" },
];

export const salesByRange = {
  "7 days": [
    { label: "Mon", revenue: 4800, orders: 18 }, { label: "Tue", revenue: 6200, orders: 23 },
    { label: "Wed", revenue: 5400, orders: 21 }, { label: "Thu", revenue: 8100, orders: 31 },
    { label: "Fri", revenue: 7100, orders: 27 }, { label: "Sat", revenue: 9600, orders: 36 },
    { label: "Sun", revenue: 7400, orders: 29 },
  ],
  "30 days": [
    { label: "Week 1", revenue: 28400, orders: 102 }, { label: "Week 2", revenue: 31600, orders: 118 },
    { label: "Week 3", revenue: 27900, orders: 97 }, { label: "Week 4", revenue: 35200, orders: 131 },
  ],
  "12 months": [
    { label: "May", revenue: 74800, orders: 284 }, { label: "Jun", revenue: 82100, orders: 306 },
    { label: "Jul", revenue: 78900, orders: 291 }, { label: "Aug", revenue: 94200, orders: 348 },
    { label: "Sep", revenue: 101600, orders: 377 }, { label: "Oct", revenue: 112400, orders: 418 },
  ],
};
