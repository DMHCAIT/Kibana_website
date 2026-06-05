"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function WhatsAppButton() {
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const phoneNumber = "9711414110";

  useEffect(() => {
    const kibanaLogoUrl = `${window.location.origin}/kihana-logo.png`;
    const message = `🎀 *KIBANA - Pure. Minimal. Luxe.*\n\n${kibanaLogoUrl}\n\nHi! I'm interested in Kibana's premium vegan leather handbags.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(url);
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10 z-40
                 w-14 h-14 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 active:scale-95
                 text-white rounded-full
                 shadow-2xl hover:shadow-3xl hover:shadow-green-500/80
                 transition-all duration-300 ease-in-out
                 flex items-center justify-center
                 animate-pulse hover:animate-bounce
                 border-3 border-white/70
                 hover:border-white"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
    </a>
  );
}
