/**
 * Tricolor divider component - Indian flag colors
 * Saffron (#FF9933) | White (#FFFFFF) | Green (#4CAF50)
 */

export function TricolorDivider() {
  return (
    <div className="flex h-1.5 w-full">
      <div className="flex-1 bg-[#FF9933]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#4CAF50]" />
    </div>
  );
}

/**
 * Tricolor accent bar - used for section decoration
 */
export function TricolorAccent() {
  return (
    <div className="flex h-1 w-16">
      <div className="flex-1 bg-[#FF9933]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#4CAF50]" />
    </div>
  );
}

/**
 * Tricolor background gradient
 */
export function TricolorGradient() {
  return <div className="bg-gradient-to-r from-[#FF9933] via-white to-[#4CAF50]" />;
}
