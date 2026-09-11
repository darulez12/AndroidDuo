/** Physical tunables, matching FoldParameters in the original iOS demo. */
export const FOLD_PARAMS = {
  eyeDistanceMillimeters: 320,
  pointsPerMillimeter: 6,
  blurSpread: 0.12,
  darkening: 0.015,
} as const;

export const EYE_DISTANCE_POINTS =
  FOLD_PARAMS.eyeDistanceMillimeters * FOLD_PARAMS.pointsPerMillimeter;

export const MAX_TILT_DEGREES = 45;
export const DEG = Math.PI / 180;
