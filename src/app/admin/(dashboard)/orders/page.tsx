import { getOrders } from "@/lib/server-data";
import { OrdersClient } from "./orders-client";

export default async function OrdersPage() {
  const orders = (await getOrders()).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
  const total = orders.reduce((s, o) => s + o.total, 0);
  return <OrdersClient orders={orders} total={total} />;
}
