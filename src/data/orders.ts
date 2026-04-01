// Placeholder for product images (replace with real images later)
const PRODUCT_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3C/svg%3E";

export type OrderStatus = "confirmed" | "packed" | "shipped" | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: Date;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  address: {
    name: string;
    phone: string;
    address: string;
    landmark: string;
    pincode: string;
    type: "home" | "work";
  };
  paymentMethod: string;
  estimatedDelivery: string;
  deliveryPartner?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
}

// Dummy orders data - reverse chronological order
export const dummyOrders: Order[] = [
  {
    id: "ORD2024020801",
    date: new Date(),
    status: "shipped",
    items: [
      {
        id: "1",
        name: "Peanut Butter Protein Bar",
        variant: "Pack of 6 • Dark Chocolate",
        quantity: 2,
        price: 129,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
      {
        id: "5",
        name: "Ragi Millet Energy Bar",
        variant: "Pack of 4 • Classic",
        quantity: 1,
        price: 99,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
    ],
    subtotal: 357,
    deliveryCharge: 0,
    discount: 30,
    total: 327,
    address: {
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      address: "123, Green Valley Apartments, Koramangala, 5th Block",
      landmark: "Near Sony World Signal",
      pincode: "560095, Bangalore",
      type: "home",
    },
    paymentMethod: "UPI - Google Pay",
    estimatedDelivery: "Today, by 7:30 PM",
    deliveryPartner: {
      name: "Suresh Kumar",
      phone: "+91 87654 32109",
      vehicleNumber: "KA 01 AB 1234",
    },
  },
  {
    id: "ORD2024020702",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "delivered",
    items: [
      {
        id: "3",
        name: "Traditional Peanut Chikki",
        variant: "Pack of 12 • Original",
        quantity: 1,
        price: 149,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
      {
        id: "4",
        name: "Healthy Trail Mix",
        variant: "250g • Premium",
        quantity: 2,
        price: 199,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
    ],
    subtotal: 547,
    deliveryCharge: 0,
    discount: 50,
    total: 497,
    address: {
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      address: "Tech Park, Tower B, 4th Floor",
      landmark: "Opposite Metro Station",
      pincode: "560103, Bangalore",
      type: "work",
    },
    paymentMethod: "Credit Card - •••• 4521",
    estimatedDelivery: "Delivered on Feb 7",
  },
  {
    id: "ORD2024020503",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "delivered",
    items: [
      {
        id: "6",
        name: "Combo Value Pack",
        variant: "Mixed • 8 Bars",
        quantity: 1,
        price: 399,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
    ],
    subtotal: 399,
    deliveryCharge: 0,
    discount: 0,
    total: 399,
    address: {
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      address: "123, Green Valley Apartments, Koramangala, 5th Block",
      landmark: "Near Sony World Signal",
      pincode: "560095, Bangalore",
      type: "home",
    },
    paymentMethod: "Cash on Delivery",
    estimatedDelivery: "Delivered on Feb 5",
  },
  {
    id: "ORD2024020104",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: "delivered",
    items: [
      {
        id: "2",
        name: "Multigrain Protein Snack",
        variant: "Pack of 10 • Masala",
        quantity: 3,
        price: 179,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
      {
        id: "1",
        name: "Peanut Butter Protein Bar",
        variant: "Pack of 6 • Almond",
        quantity: 1,
        price: 129,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
    ],
    subtotal: 666,
    deliveryCharge: 0,
    discount: 66,
    total: 600,
    address: {
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      address: "123, Green Valley Apartments, Koramangala, 5th Block",
      landmark: "Near Sony World Signal",
      pincode: "560095, Bangalore",
      type: "home",
    },
    paymentMethod: "UPI - PhonePe",
    estimatedDelivery: "Delivered on Feb 1",
  },
  {
    id: "ORD2024012505",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: "delivered",
    items: [
      {
        id: "5",
        name: "Ragi Millet Energy Bar",
        variant: "Pack of 8 • Jaggery",
        quantity: 2,
        price: 189,
        image: PRODUCT_IMAGE_PLACEHOLDER,
      },
    ],
    subtotal: 378,
    deliveryCharge: 49,
    discount: 0,
    total: 427,
    address: {
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      address: "Tech Park, Tower B, 4th Floor",
      landmark: "Opposite Metro Station",
      pincode: "560103, Bangalore",
      type: "work",
    },
    paymentMethod: "Net Banking - HDFC",
    estimatedDelivery: "Delivered on Jan 25",
  },
];

export const getOrderById = (id: string): Order | undefined => {
  return dummyOrders.find((order) => order.id === id);
};

export const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    confirmed: "Order Confirmed",
    packed: "Packed",
    shipped: "Out for Delivery",
    delivered: "Delivered",
  };
  return labels[status];
};

export const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    confirmed: "bg-blue-100 text-blue-700",
    packed: "bg-amber-100 text-amber-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-secondary/20 text-secondary",
  };
  return colors[status];
};
