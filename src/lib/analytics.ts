import type { Product } from "@/types/product";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

type Ga4Item = {
  item_id: string;
  item_name: string;
  item_category: string;
  item_brand: string;
  price: number;
  quantity: number;
};

function canTrack() {
  return typeof window !== "undefined" && Array.isArray(window.dataLayer);
}

function pushEvent(payload: Record<string, unknown>) {
  if (!canTrack()) return;
  window.dataLayer.push(payload);
}

function toGa4Item(product: Product, quantity = 1): Ga4Item {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    item_brand: "Kibana",
    price: product.price,
    quantity,
  };
}

export function trackLogin(userId: string) {
  pushEvent({
    event: "login",
    method: "email_otp",
    user_id: userId,
  });
}

export function trackSignUp(userId: string) {
  pushEvent({
    event: "sign_up",
    method: "email_otp",
    user_id: userId,
  });
}

export function trackViewItem(product: Product) {
  pushEvent({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: product.price,
      items: [toGa4Item(product)],
    },
  });
}

export function trackAddToCart(product: Product, quantity: number) {
  pushEvent({
    event: "add_to_cart",
    ecommerce: {
      currency: "INR",
      value: product.price * quantity,
      items: [toGa4Item(product, quantity)],
    },
  });
}
