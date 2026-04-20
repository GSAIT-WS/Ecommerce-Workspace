import type { CrunchxDoodleColor } from "./crunchxDoodlePalette";

const stroke = {
  fill: "none" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type DoodleSpriteName =
  | "peanut"
  | "sesame"
  | "coconut"
  | "seedPumpkin"
  | "seedSunflower"
  | "seedFlax"
  | "milletCluster"
  | "grainCluster"
  | "snackBar"
  | "berry"
  | "leaf";

type SpriteProps = {
  color: CrunchxDoodleColor;
  /** Base stroke width in user units (scaled by parent) */
  w?: number;
};

/** Local viewBox 0 0 32 32 for all sprites */
export function CrunchXDoodleSprite({ name, color, w = 1.35 }: SpriteProps & { name: DoodleSpriteName }) {
  const s = { ...stroke, stroke: color, strokeWidth: w };
  switch (name) {
    case "peanut":
      return (
        <g {...s}>
          <ellipse cx="11" cy="14" rx="5.2" ry="7" transform="rotate(-16 11 14)" />
          <ellipse cx="17.5" cy="14" rx="5.2" ry="7" transform="rotate(16 17.5 14)" />
        </g>
      );
    case "sesame":
      return (
        <g {...s}>
          <ellipse cx="16" cy="16" rx="2.2" ry="5" transform="rotate(22 16 16)" />
        </g>
      );
    case "coconut":
      return (
        <g {...s}>
          <path d="M8 10c0-4 3.5-6 8-6s8 2 8 6c0 5-4 10-8 12-4-2-8-7-8-12z" />
          <path d="M12 14c1.2 2 2.8 3.5 4 4.5" opacity={0.85} />
          <path d="M16 12v6" opacity={0.7} />
        </g>
      );
    case "seedPumpkin":
      return (
        <g {...s}>
          <path d="M16 6c-3 2-5 5-5 9 0 4 2 8 5 9 3-1 5-5 5-9 0-4-2-7-5-9z" />
        </g>
      );
    case "seedSunflower":
      return (
        <g {...s}>
          <ellipse cx="16" cy="15" rx="3.5" ry="5.5" transform="rotate(-8 16 15)" />
          <path d="M16 20v4" />
        </g>
      );
    case "seedFlax":
      return (
        <g {...s}>
          <ellipse cx="16" cy="15" rx="2" ry="6" transform="rotate(35 16 15)" />
        </g>
      );
    case "milletCluster":
      return (
        <g {...s}>
          <path d="M16 24V10" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="16" cy="9" r="1.6" />
          <circle cx="20" cy="12" r="1.6" />
          <circle cx="14" cy="15" r="1.4" />
          <circle cx="18" cy="16" r="1.4" />
        </g>
      );
    case "grainCluster":
      return (
        <g {...s}>
          <path d="M16 24c-2-8-1-14 0-16" />
          <path d="M16 24c2-7 4-11 6-12" />
          <path d="M16 24c-3-6-6-9-8-9" />
          <ellipse cx="16" cy="7" rx="2" ry="3" />
          <ellipse cx="22" cy="11" rx="1.8" ry="2.8" transform="rotate(25 22 11)" />
          <ellipse cx="10" cy="11" rx="1.8" ry="2.8" transform="rotate(-25 10 11)" />
        </g>
      );
    case "snackBar":
      return (
        <g {...s}>
          <rect x="5" y="9" width="22" height="14" rx="3" ry="3" />
          <path d="M9 13h14M9 17h10M9 21h12" opacity={0.9} />
        </g>
      );
    case "berry":
      return (
        <g {...s}>
          <circle cx="16" cy="15" r="5" />
          <path d="M16 10v-3M13 8l-1-2M19 8l1-2" />
        </g>
      );
    case "leaf":
      return (
        <g {...s}>
          <path d="M8 20c4-10 12-14 16-12-2 6-8 12-16 12z" />
          <path d="M14 14c2 2 4 3 6 3" opacity={0.8} />
        </g>
      );
  }
}
