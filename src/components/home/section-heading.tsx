import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  className,
  align = "left",
}: {
  title: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <h2
      className={cn(
        "font-bold uppercase tracking-[0.15em] text-base sm:text-lg mb-4 sm:mb-6 text-foreground",
        align === "center" && "text-center",
        className,
      )}
    >
      {title}
    </h2>
  );
}
