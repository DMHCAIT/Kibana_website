"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phoneNumber = "9711414110";
  const message = "Hi! I'm interested in Kibana's premium vegan leather handbags.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10 z-50
                 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                 bg-green-500 hover:bg-green-600 active:bg-green-700
                 text-white rounded-full
                 shadow-xl hover:shadow-2xl hover:shadow-green-500/60
                 transition-all duration-300 ease-in-out
                 flex items-center justify-center
                 animate-bounce hover:animate-none
                 border-2 border-green-400/30
                 hover:border-green-400/60"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
    </a>
  );
}
