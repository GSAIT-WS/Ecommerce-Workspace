import { cn } from "@/lib/utils";
import { crunchxDoodlePalette as P } from "./crunchxDoodlePalette";
import { CrunchXDoodleSprite, type DoodleSpriteName } from "./CrunchXDoodleSprites";
import type { CrunchxDoodleColor } from "./crunchxDoodlePalette";

type RowItem = { name: DoodleSpriteName; x: number; c: CrunchxDoodleColor; r: number; s: number };

/** Irregular horizontal rhythm — not a tight repeating pattern */
const DIVIDER_ROW: RowItem[] = [
  { name: "sesame", x: 40, c: P.neutral, r: 25, s: 0.55 },
  { name: "seedFlax", x: 120, c: P.lightBrown, r: -30, s: 0.5 },
  { name: "milletCluster", x: 220, c: P.softOrange, r: 8, s: 0.72 },
  { name: "peanut", x: 340, c: P.lightBeige, r: -15, s: 0.68 },
  { name: "snackBar", x: 460, c: P.mildPurple, r: 3, s: 0.62 },
  { name: "grainCluster", x: 600, c: P.softBlue, r: -8, s: 0.7 },
  { name: "coconut", x: 740, c: P.neutral, r: 6, s: 0.65 },
  { name: "seedPumpkin", x: 880, c: P.softOrange, r: 20, s: 0.52 },
  { name: "berry", x: 980, c: P.lightBrown, r: 0, s: 0.58 },
  { name: "seedSunflower", x: 1080, c: P.lightBeige, r: -12, s: 0.55 },
  { name: "sesame", x: 1180, c: P.mildPurple, r: 45, s: 0.48 },
  { name: "leaf", x: 1280, c: P.softBlue, r: -22, s: 0.6 },
  { name: "snackBar", x: 1380, c: P.neutral, r: -5, s: 0.58 },
];

type Props = {
  className?: string;
};

/**
 * Horizontal band for between sections — low visual weight, lots of whitespace above/below via margin.
 */
export function CrunchXSectionDivider({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none select-none",
        "my-6 md:my-10",
        "opacity-[0.1] dark:opacity-[0.072]",
        "px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
        className,
      )}
    >
      <svg
        className="mx-auto h-12 w-full max-w-5xl md:h-14"
        viewBox="0 0 1480 56"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {DIVIDER_ROW.map((it, i) => (
          <g key={`${it.name}-${i}`} transform={`translate(${it.x} 28) rotate(${it.r}) scale(${it.s})`}>
            <g transform="translate(-16 -16)">
              <CrunchXDoodleSprite name={it.name} color={it.c} w={1.25} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
