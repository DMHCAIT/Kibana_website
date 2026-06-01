"use client";

import { MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  price: number;
};

export function WhatsAppShare({ product, price }: Props) {
  const shareToWhatsApp = () => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const productUrl = `${appUrl}/shop/${product.slug}`;
    
    const message = `🛍️ *Check out this amazing product from Kibana!*

*${product.name}*
💰 Price: ₹${price.toLocaleString("en-IN")}
📝 ${product.description}

🔗 View Product: ${productUrl}

Shop now on Kibana - Pure. Minimal. Luxe. 🎁`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={shareToWhatsApp}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
      title="Share on WhatsApp"
    >
      <MessageCircle className="h-4 w-4" />
      Share on WhatsApp
    </button>
  );
}
