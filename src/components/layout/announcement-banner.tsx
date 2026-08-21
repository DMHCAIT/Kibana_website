const DEFAULT_PHRASES = [
  "RAKHI SALE",
  "UPTO 60% OFF ON SELECTED STYLES",
  "100% PREMIUM VEGAN LEATHER",
  "THIS RAKHI GIFT HER SOMETHING SHE'LL CARRY EVERYDAY.",
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
    <div
      className="w-full overflow-hidden py-2 text-[#fadca0]"
      style={{ backgroundColor: "#b83530" }}
    >
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
                <span className="text-[#fadca0]">◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
