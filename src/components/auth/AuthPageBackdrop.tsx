import type { ReactNode } from "react";

type AuthPageBackdropProps = {
  children: ReactNode;
};

export function AuthPageBackdrop({ children }: AuthPageBackdropProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/60 to-accent/25 px-4 py-10 dark:from-background dark:via-muted/20 dark:to-secondary/15">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_72%_60%_at_50%_42%,black,transparent)] dark:bg-[linear-gradient(to_right,hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-28 top-0 h-[26rem] w-[26rem] rounded-full bg-primary/18 blur-3xl dark:bg-primary/22"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-12 h-[20rem] w-[20rem] rounded-full bg-secondary/14 blur-3xl dark:bg-secondary/18"
        aria-hidden
      />
      {children}
    </div>
  );
}
