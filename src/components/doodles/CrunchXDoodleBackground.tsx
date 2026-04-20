import { cn } from "@/lib/utils";
import { crunchxDoodlePalette as P } from "./crunchxDoodlePalette";
import { CrunchXDoodleSprite, type DoodleSpriteName } from "./CrunchXDoodleSprites";
import type { CrunchxDoodleColor } from "./crunchxDoodlePalette";

type Placement = {
  name: DoodleSpriteName;
  x: number;
  y: number;
  r: number;
  s: number;
  c: CrunchxDoodleColor;
};

/** Sparse scatter — no tight grid; safe margins ~8–12% from edges */
const HOME_PLACEMENTS: Placement[] = [
  { name: "peanut", x: 120, y: 180, r: -18, s: 1.15, c: P.softOrange },
  { name: "sesame", x: 280, y: 95, r: 40, s: 0.85, c: P.lightBrown },
  { name: "coconut", x: 1420, y: 160, r: 8, s: 1, c: P.lightBeige },
  { name: "snackBar", x: 1280, y: 320, r: -6, s: 1.05, c: P.softOrange },
  { name: "milletCluster", x: 90, y: 420, r: 12, s: 1, c: P.neutral },
  { name: "grainCluster", x: 320, y: 520, r: -10, s: 0.95, c: P.lightBrown },
  { name: "seedPumpkin", x: 520, y: 200, r: 25, s: 0.75, c: P.mildPurple },
  { name: "seedSunflower", x: 680, y: 140, r: -15, s: 0.8, c: P.softBlue },
  { name: "seedFlax", x: 850, y: 260, r: 55, s: 0.7, c: P.lightBeige },
  { name: "berry", x: 1050, y: 180, r: 0, s: 0.85, c: P.softOrange },
  { name: "leaf", x: 1180, y: 480, r: -25, s: 0.9, c: P.softBlue },
  { name: "peanut", x: 1500, y: 640, r: 22, s: 0.9, c: P.lightBrown },
  { name: "sesame", x: 200, y: 720, r: -35, s: 0.7, c: P.neutral },
  { name: "coconut", x: 440, y: 820, r: -8, s: 0.95, c: P.mildPurple },
  { name: "snackBar", x: 720, y: 680, r: 4, s: 1, c: P.lightBeige },
  { name: "milletCluster", x: 980, y: 760, r: -5, s: 1.05, c: P.softOrange },
  { name: "grainCluster", x: 1320, y: 900, r: 15, s: 1, c: P.neutral },
  { name: "seedPumpkin", x: 160, y: 980, r: -20, s: 0.65, c: P.softBlue },
  { name: "seedSunflower", x: 560, y: 1020, r: 10, s: 0.72, c: P.mildPurple },
  { name: "seedFlax", x: 880, y: 1080, r: -40, s: 0.68, c: P.lightBrown },
  { name: "berry", x: 1120, y: 980, r: 12, s: 0.78, c: P.softOrange },
  { name: "peanut", x: 1460, y: 1040, r: -14, s: 0.88, c: P.lightBeige },
  { name: "sesame", x: 380, y: 300, r: 60, s: 0.6, c: P.neutral },
  { name: "leaf", x: 620, y: 420, r: 35, s: 0.75, c: P.softBlue },
  { name: "snackBar", x: 240, y: 600, r: -3, s: 0.92, c: P.mildPurple },
  { name: "coconut", x: 920, y: 540, r: 6, s: 0.88, c: P.lightBrown },
  { name: "milletCluster", x: 1380, y: 420, r: 8, s: 0.98, c: P.softOrange },
];

const PRODUCT_PLACEMENTS: Placement[] = [
  { name: "sesame", x: 140, y: 120, r: 30, s: 0.75, c: P.neutral },
  { name: "grainCluster", x: 1240, y: 200, r: -12, s: 0.95, c: P.lightBrown },
  { name: "snackBar", x: 200, y: 520, r: 5, s: 0.9, c: P.softOrange },
  { name: "milletCluster", x: 1320, y: 600, r: -8, s: 1, c: P.lightBeige },
  { name: "peanut", x: 100, y: 900, r: 20, s: 0.85, c: P.mildPurple },
  { name: "seedSunflower", x: 1450, y: 880, r: -25, s: 0.7, c: P.softBlue },
  { name: "berry", x: 720, y: 180, r: 0, s: 0.72, c: P.softOrange },
  { name: "coconut", x: 900, y: 980, r: 10, s: 0.88, c: P.neutral },
  { name: "seedFlax", x: 480, y: 240, r: 45, s: 0.65, c: P.lightBrown },
  { name: "leaf", x: 1080, y: 420, r: -30, s: 0.7, c: P.softBlue },
];

export type CrunchXDoodleBackgroundVariant = "home" | "product";

type Props = {
  variant: CrunchXDoodleBackgroundVariant;
  className?: string;
};

/**
 * Full-page subtle line-art layer. Transparent; opacity ~6–7% (lighter in dark mode).
 */
export function CrunchXDoodleBackground({ variant, className }: Props) {
  const placements = variant === "home" ? HOME_PLACEMENTS : PRODUCT_PLACEMENTS;
  const vbW = 1600;
  const vbH = variant === "home" ? 1200 : 1000;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none select-none",
        /* Was ~6%; hero + cards hide most of the layer — use ~11% / ~8% so whitespace shows a clear hint */
        "opacity-[0.11] dark:opacity-[0.075]",
        className,
      )}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {placements.map((p, i) => (
          <g key={`${p.name}-${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s})`}>
            <g transform="translate(-16 -16)">
              <CrunchXDoodleSprite name={p.name} color={p.c} w={1.4} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
