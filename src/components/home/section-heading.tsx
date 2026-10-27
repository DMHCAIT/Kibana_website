import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  className,
  align = "center",
  subtitle,
  eyebrow,
}: {
  title: string;
  className?: string;
  align?: "left" | "center";
  subtitle?: string;
  eyebrow?: string;
}) {
  const center = align === "center";
  return (
    <div className={cn("storefront-section-heading", center && "text-center", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className={cn("section-title", !center && "text-left")}>{title}</h2>
      {subtitle && (
        <p className={cn("mt-3 max-w-xl text-[13px] text-muted-foreground", center && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
