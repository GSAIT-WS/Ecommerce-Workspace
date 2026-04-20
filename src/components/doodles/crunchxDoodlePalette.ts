/**
 * CrunchX packaging-inspired stroke colors (line-art only).
 * Final visibility comes from the layer opacity (~6–7%), not these alone.
 */
export const crunchxDoodlePalette = {
  softOrange: "#E8955C",
  lightBeige: "#D9C4A8",
  softBlue: "#8BA9C9",
  mildPurple: "#B8A8D4",
  lightBrown: "#A68B6A",
  neutral: "#C5B8A8",
} as const;

export type CrunchxDoodleColor = (typeof crunchxDoodlePalette)[keyof typeof crunchxDoodlePalette];
