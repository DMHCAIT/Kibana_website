import Link from "next/link";
import { BookOpen, Phone, HelpCircle, RotateCcw, Store } from "lucide-react";

const PAGES = [
  {
    href: "/admin/pages/about",
    icon: BookOpen,
    title: "About Us",
    description: "Edit the About Us page — brand story, team, mission statement.",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
  },
  {
    href: "/admin/pages/contact",
    icon: Phone,
    title: "Contact Page",
    description: "Update contact details, phone, email, WhatsApp, and address.",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-100",
  },
  {
    href: "/admin/pages/faqs",
    icon: HelpCircle,
    title: "FAQs",
    description: "Manage frequently asked questions — add, edit, or remove entries.",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-100",
  },
  {
    href: "/admin/pages/returns",
    icon: RotateCcw,
    title: "Returns Policy",
    description: "Update your returns and exchange policy content.",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
  },
  {
    href: "/admin/pages/shop",
    icon: Store,
    title: "Shop Page",
    description: "Edit the shop page header, banner text, and promotional content.",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-100",
  },
];

export default function AdminPagesIndex() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pages & Content</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit the content of your website pages. Changes are saved to the database and reflected immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAGES.map(({ href, icon: Icon, title, description, bg, text, border }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all flex items-start gap-4"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg} border ${border}`}>
                <Icon className={`h-5 w-5 ${text}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {title}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
