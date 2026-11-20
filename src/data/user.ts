// Dummy user data for profile page
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/productImagePlaceholder";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedDate: string;
}

export interface HealthPreference {
  id: string;
  label: string;
  enabled: boolean;
  icon: string;
}

export interface SavedAddress {
  id: string;
  type: "home" | "work" | "other";
  label: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "upi" | "card" | "wallet";
  label: string;
  details: string;
  isDefault: boolean;
}

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
}

export interface RatedProduct {
  id: string;
  name: string;
  image: string;
  rating: number;
  review?: string;
  date: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  offersPromotions: boolean;
  systemNotifications: boolean;
}

// Dummy User Data
export const userProfile: UserProfile = {
  id: "USR001",
  name: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  phone: "+91 98765 43210",
  avatar: "",
  joinedDate: "March 2024",
};

export const healthPreferences: HealthPreference[] = [
  { id: "1", label: "High Protein", enabled: true, icon: "💪" },
  { id: "2", label: "Low Sugar", enabled: true, icon: "🍬" },
  { id: "3", label: "Gluten Free", enabled: false, icon: "🌾" },
  { id: "4", label: "Vegan", enabled: false, icon: "🌱" },
  { id: "5", label: "Keto Friendly", enabled: true, icon: "🥑" },
  { id: "6", label: "No Preservatives", enabled: true, icon: "✨" },
  { id: "7", label: "Organic", enabled: false, icon: "🍃" },
  { id: "8", label: "Diabetic Friendly", enabled: false, icon: "💉" },
];

export const savedAddresses: SavedAddress[] = [
  {
    id: "addr1",
    type: "home",
    label: "Home",
    address: "B-42, Green Valley Apartments, Sector 18",
    city: "Noida, UP",
    pincode: "201301",
    isDefault: true,
  },
  {
    id: "addr2",
    type: "work",
    label: "Work",
    address: "Tower B, 5th Floor, Cyber Hub",
    city: "Gurugram, HR",
    pincode: "122002",
    isDefault: false,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "pay1",
    type: "upi",
    label: "Google Pay",
    details: "rahul@okaxis",
    isDefault: true,
  },
  {
    id: "pay2",
    type: "card",
    label: "HDFC Credit Card",
    details: "•••• 4532",
    isDefault: false,
  },
  {
    id: "pay3",
    type: "wallet",
    label: "Paytm Wallet",
    details: "₹1,250 balance",
    isDefault: false,
  },
];

export const ratedProducts: RatedProduct[] = [
  {
    id: "1",
    name: "Shilajit Energy Bar",
    image: PRODUCT_IMAGE_PLACEHOLDER,
    rating: 5,
    review: "Amazing taste and energy boost!",
    date: "2 weeks ago",
  },
  {
    id: "2",
    name: "Millet Crunch Bar",
    image: PRODUCT_IMAGE_PLACEHOLDER,
    rating: 4,
    review: "Good healthy snack option",
    date: "1 month ago",
  },
];

export const recentlyViewed: RecentlyViewedProduct[] = [
  {
    id: "4",
    name: "Peanut Chikki Bar",
    image: PRODUCT_IMAGE_PLACEHOLDER,
    price: 79,
    originalPrice: 99,
  },
];

export const notificationSettings: NotificationSettings = {
  orderUpdates: true,
  offersPromotions: true,
  systemNotifications: false,
};

export const faqs = [
  {
    question: "How do I track my order?",
    answer: "Go to My Orders section and click on any order to see real-time tracking updates with delivery partner details.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer hassle-free returns within 7 days of delivery for unopened products. Opened products can be returned only if damaged.",
  },
  {
    question: "How can I change my delivery address?",
    answer: "You can update your delivery address before the order is shipped. Go to Profile > Addresses to manage your saved locations.",
  },
  {
    question: "Are your products certified?",
    answer: "Yes, all our products are FSSAI certified and undergo strict quality checks. We source ingredients from certified organic farms.",
  },
];
