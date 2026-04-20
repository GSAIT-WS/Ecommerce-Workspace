import { cn } from "@/lib/utils";
import { crunchxDoodlePalette as P } from "./crunchxDoodlePalette";
import { CrunchXDoodleSprite, type DoodleSpriteName } from "./CrunchXDoodleSprites";
import type { CrunchxDoodleColor } from "./crunchxDoodlePalette";

type Corner = { name: DoodleSpriteName; c: CrunchxDoodleColor; r: number; s: number };

const TL: Corner[] = [
  { name: "peanut", c: P.softOrange, r: -12, s: 1.05 },
  { name: "sesame", c: P.lightBrown, r: 35, s: 0.65 },
  { name: "grainCluster", c: P.neutral, r: 5, s: 0.85 },
];

const TR: Corner[] = [
  { name: "coconut", c: P.lightBeige, r: 8, s: 0.95 },
  { name: "seedSunflower", c: P.softBlue, r: -20, s: 0.7 },
];

const BL: Corner[] = [
  { name: "snackBar", c: P.mildPurple, r: -4, s: 0.9 },
  { name: "milletCluster", c: P.softOrange, r: 10, s: 0.88 },
];

const BR: Corner[] = [
  { name: "peanut", c: P.lightBrown, r: 18, s: 0.82 },
  { name: "berry", c: P.softOrange, r: 0, s: 0.72 },
  { name: "leaf", c: P.softBlue, r: -25, s: 0.68 },
];

function CornerCluster({
  items,
  className,
}: {
  items: Corner[];
  className?: string;
}) {
  return (
    <svg
      className={cn("h-28 w-28 md:h-36 md:w-36", className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {items.map((it, i) => {
        const ox = 24 + (i % 2) * 52;
        const oy = 20 + Math.floor(i / 2) * 48;
        return (
          <g key={`${it.name}-${i}`} transform={`translate(${ox} ${oy}) rotate(${it.r}) scale(${it.s})`}>
            <g transform="translate(-16 -16)">
              <CrunchXDoodleSprite name={it.name} color={it.c} w={1.35} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

type Props = { className?: string };

/**
 * Corner accents with safe inset from viewport edges (respects mobile safe areas via padding on parent).
 */
export function CrunchXCornerDoodles({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none select-none",
        "opacity-[0.11] dark:opacity-[0.078]",
        className,
      )}
    >
      <CornerCluster items={TL} className="absolute left-[max(1rem,env(safe-area-inset-left))] top-[max(4.5rem,env(safe-area-inset-top))]" />
      <CornerCluster items={TR} className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(4.5rem,env(safe-area-inset-top))]" />
      <CornerCluster items={BL} className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))]" />
      <CornerCluster items={BR} className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]" />
    </div>
  );
}
