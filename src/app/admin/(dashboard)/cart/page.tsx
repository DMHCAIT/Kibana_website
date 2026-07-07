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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Cart Items</h1>
            <p className="text-sm text-gray-600 mt-1">Real-time tracking of items in customer shopping carts</p>
          </div>
        </div>
        <ShoppingCart className="w-8 h-8 text-gray-400" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Cart Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatINR(totalValue)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Customers with Items</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{uniqueCustomers}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Unique Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{uniqueProducts}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Items Count</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalItemsInCarts}</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
            <p>No items in customer carts</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cartItems.map((item) => {
                const itemTotal = item.productPrice * item.quantity;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">{item.customerName}</p>
                        <p className="text-xs text-gray-600">{item.customerEmail}</p>
                        {item.customerPhone && (
                          <p className="text-xs text-gray-600">{item.customerPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                          {item.color && (
                            <p className="text-xs text-gray-600">Color: {item.color}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 font-semibold">{item.quantity}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{formatINR(item.productPrice)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">{formatINR(itemTotal)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
