import { getProducts, getCategories, getOrders, getUsers } from "@/lib/server-data";
import Image from "next/image";
import Link from "next/link";
import { Package, Tag, Star, Sparkles, Users, ShoppingCart } from "lucide-react";

export default async function AdminDashboard() {
  const products = await getProducts();
  const categories = await getCategories();
  const orders = await getOrders();
  const users = await getUsers();
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const bestSellers = products.filter((p) => p.isBestSeller).length;
  const newArrivals = products.filter((p) => p.isNew).length;
  const _trending = products.filter((p) => p.isTrending).length;

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
    { label: "Categories", value: totalCategories, icon: Tag, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
    { label: "Total Users", value: users.length, icon: Users, bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
    { label: "Orders", value: orders.length, icon: ShoppingCart, bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" },
    { label: "Best Sellers", value: bestSellers, icon: Star, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
    { label: "New Arrivals", value: newArrivals, icon: Sparkles, bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
  ];

  return (
    <div className="p-6 overflow-y-auto h-full">
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to Kibana Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-xl p-5 border ${s.bg} ${s.border} flex flex-col gap-3`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.text}`} />
              </div>
              <div>
                <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                <p className={`text-xs font-medium mt-0.5 ${s.text} opacity-80`}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            View all {totalProducts} →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Tags</th>
                <th className="px-6 py-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.slice(0, 6).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs capitalize text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {p.category.replace(/-/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-semibold text-gray-800 text-xs">₹{p.price.toLocaleString()}</span>
                    {p.compareAtPrice && (
                      <span className="text-[10px] text-gray-400 line-through ml-1.5">
                        ₹{p.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {p.isBestSeller && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">Best Seller</span>
                      )}
                      {p.isNew && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-full font-medium">New</span>
                      )}
                      {p.isTrending && (
                        <span className="text-[10px] bg-pink-50 text-pink-700 border border-pink-100 px-1.5 py-0.5 rounded-full font-medium">Trending</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs text-amber-500 font-medium">★ {p.rating}</span>
                    <span className="text-[10px] text-gray-400 ml-1">({p.reviewCount})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Link
          href="/admin/products"
          className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="font-semibold text-gray-800 text-sm">Manage Products</p>
            <p className="text-xs text-gray-400 mt-0.5">View & review all {totalProducts} products</p>
          </div>
          <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-lg">→</span>
        </Link>
        <Link
          href="/admin/categories"
          className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all group"
        >
          <div>
            <p className="font-semibold text-gray-800 text-sm">Manage Categories</p>
            <p className="text-xs text-gray-400 mt-0.5">View all {totalCategories} categories</p>
          </div>
          <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-lg">→</span>
        </Link>
      </div>
    </div>
    </div>
  );
}
