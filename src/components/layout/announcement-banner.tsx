const DEFAULT_PHRASES = [
  "FREE RETURNS ON ALL ORDERS",
  "100% PREMIUM VEGAN LEATHER — CRUELTY FREE",
  "HAND-FINISHED. EVERY PIECE. EVERY TIME.",
  "FREE SHIPPING ON ORDERS ABOVE ₹999",
];

export function AnnouncementBanner({ text }: { text?: string }) {
  const phrases = text
    ? text.split("·").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_PHRASES;

  return (
    <div className="w-full bg-black text-white overflow-hidden py-2">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(3)].map((_, i) => (
          <span key={i} className="flex items-center gap-0 shrink-0">
            {phrases.map((phrase, j) => (
              <span key={j} className="flex items-center">
                <span className="text-[11px] font-medium tracking-widest uppercase px-6">{phrase}</span>
                <span className="text-[#c9a96e]">◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
