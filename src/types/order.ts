export interface Order {
  id: string;
  user?: {
    name: string;
    phone?: string;
    email?: string;
    id?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color?: string;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending" | "refunded";
  trackingId?: string;
  placedAt: string;
}
