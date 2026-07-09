import { getOrders } from "@/lib/server-data";
import { OrdersClient } from "@/components/admin/orders-client";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function AdminOrdersPage() {
  const orders = await withTimeout(getOrders(), 2500, []);
  const sorted = [...orders].sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
  return <OrdersClient initialOrders={sorted} />;
}

