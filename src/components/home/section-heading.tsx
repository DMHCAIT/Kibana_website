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
        "mb-5 text-lg font-bold uppercase leading-tight tracking-[0.15em] text-foreground sm:mb-6 sm:text-xl md:text-[22px]",
        align === "center" && "text-center",
        className,
      )}
    >
      {title}
    </h2>
  );
}
