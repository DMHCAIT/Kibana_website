import { CartView } from "./cart-view";
import { TrackPageView } from "@/components/analytics/track-page-view";

export const metadata = { title: "Your Cart — Kibana" };

export default function CartPage() {
  return (
    <>
      <TrackPageView pageName="Shopping Cart" pageType="cart" />
      <CartView />
    </>
  );
}
