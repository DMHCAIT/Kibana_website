import { getCartItems } from "@/lib/server-data";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminCartPage() {
  const cartItems = await getCartItems();

  const totalValue = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
  const uniqueCustomers = new Set(cartItems.map((item) => item.userId)).size;
  const uniqueProducts = new Set(cartItems.map((item) => item.productId)).size;
  const totalItemsInCarts = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="rounded-lg p-2 transition-colors hover:bg-gray-200">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Cart Items</h1>
            <p className="mt-1 text-sm text-gray-600">
              Real-time tracking of items in customer shopping carts
            </p>
          </div>
        </div>
        <ShoppingCart className="h-8 w-8 text-gray-400" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 border-b border-gray-200 bg-gray-50 p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Total Cart Value</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatINR(totalValue)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Customers with Items</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{uniqueCustomers}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Total Unique Products</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{uniqueProducts}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">Total Items Count</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalItemsInCarts}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {cartItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <ShoppingCart className="mb-4 h-12 w-12 opacity-50" />
            <p>No items in customer carts</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 border-b border-gray-200 bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cartItems.map((item) => {
                const itemTotal = item.productPrice * item.quantity;
                return (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">{item.customerName}</p>
                        <p className="text-xs text-gray-600">{item.customerEmail}</p>
                        {item.customerPhone && (
                          <p className="text-xs text-gray-600">{item.customerPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <div className="relative h-12 w-12 overflow-hidden rounded border border-gray-200 bg-gray-100">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-900">
                            {item.productName}
                            {item.color && !item.productName.includes(item.color) && (
                              <> · {item.color}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{item.quantity}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm text-gray-900">{formatINR(item.productPrice)}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{formatINR(itemTotal)}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(item.addedAt), { addSuffix: true })}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
