const DEFAULT_PHRASES = ["100% PREMIUM VEGAN LEATHER", "FREE SHIPPING ON ORDERS ABOVE ₹999"];

export function AnnouncementBanner({ text }: { text?: string }) {
  const phrases = text
    ? text
        .split("·")
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_PHRASES;

  return (
    <div className="w-full overflow-hidden bg-foreground py-2.5 text-background">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <span key={i} className="flex shrink-0 items-center gap-0">
            {phrases.map((phrase, j) => (
              <span key={j} className="flex items-center">
                <span className="px-6 text-xs font-medium uppercase tracking-widest">{phrase}</span>
                <span className="text-accent">◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
