import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-[15px] font-semibold tracking-[-0.01em] ring-offset-background transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.97] active:duration-100",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-inset ring-white/20 hover:from-primary/95 hover:to-primary/85 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 hover:ring-white/30",
        cta:
          "bg-accent text-accent-foreground shadow-sm shadow-accent/20 ring-1 ring-inset ring-white/35 hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent/25",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm ring-1 ring-inset ring-white/20 hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-md",
        outline:
          "border border-border/90 bg-background text-foreground shadow-sm ring-1 ring-inset ring-border/40 hover:border-primary/45 hover:bg-primary/[0.07] hover:text-foreground hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20 dark:hover:bg-primary/10",
        secondary:
          "border border-transparent bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border/50 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-muted/85",
        ghost: "text-foreground hover:bg-muted hover:scale-100",
        link: "text-primary underline-offset-4 hover:underline hover:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3.5",
        lg: "h-11 rounded-md px-7",
        xl: "h-12 rounded-xl px-8 text-[15px]",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
