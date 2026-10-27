import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-100 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/90 font-semibold tracking-wide uppercase text-xs",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-border bg-background hover:bg-foreground/5 text-foreground hover:border-foreground/40 transition-all",
        secondary: "bg-muted text-foreground hover:bg-muted/80",
        ghost: "hover:bg-accent/10 hover:text-accent transition-colors",
        link: "text-accent underline-offset-4 hover:underline font-semibold",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wider uppercase text-xs",
        premium:
          "bg-accent text-accent-foreground hover:bg-accent/90 font-display font-semibold tracking-widest uppercase text-sm hover:scale-105 transform",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm rounded-sm",
        sm: "h-9 px-4 py-2 text-xs rounded-sm",
        lg: "h-12 px-8 py-3 text-base rounded-sm",
        xl: "h-14 px-10 py-4 text-base rounded-sm",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-ui-button={size === "icon" ? "icon" : "text"}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
