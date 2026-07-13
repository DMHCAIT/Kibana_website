import { CheckoutView } from "./checkout-view";
import { TrackPageView } from "@/components/analytics/track-page-view";

export const metadata = { title: "Checkout — Kibana" };

export default function CheckoutPage() {
  return (
    <>
      <TrackPageView pageName="Checkout" pageType="checkout" />
      <CheckoutView />
    </>
  );
}
