const DEFAULT_PHRASES = [
  "INDEPENDENCE DAY SALE",
  "UPTO 60% OFF ON SELECTED STYLES",
  "100% PREMIUM VEGAN LEATHER",
  "HAND-FINISHED. EVERY PIECE. EVERY TIME.",
  "FREE SHIPPING ON ORDERS ABOVE ₹999",
];

export function AnnouncementBanner({ text }: { text?: string }) {
  const phrases = text
    ? text
        .split("·")
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_PHRASES;

  return (
    <div className="w-full overflow-hidden py-2 text-white" style={{ backgroundColor: "#2d5016" }}>
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <span key={i} className="flex shrink-0 items-center gap-0">
            {phrases.map((phrase, j) => (
              <span key={j} className="flex items-center">
                <span
                  className={`px-6 text-[11px] uppercase tracking-widest ${
                    phrase.includes("100% PREMIUM VEGAN LEATHER") ? "font-light" : "font-medium"
                  }`}
                >
                  {phrase}
                </span>
                <span className="text-[#ff8c00]">◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
