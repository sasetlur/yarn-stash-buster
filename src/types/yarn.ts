export const COLOR_FAMILIES = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple',
  'pink', 'white', 'black', 'gray', 'brown', 'multicolor',
] as const;

export const YARN_WEIGHTS = [
  'lace', 'fingering', 'sport', 'DK', 'worsted', 'aran', 'bulky', 'super-bulky',
] as const;

export const FIBER_TYPES = [
  'wool', 'merino', 'cotton', 'acrylic', 'alpaca', 'silk', 'blend', 'unknown',
] as const;

export type ColorFamily = typeof COLOR_FAMILIES[number];
export type YarnWeight = typeof YARN_WEIGHTS[number];
export type FiberType = typeof FIBER_TYPES[number];

export interface YarnEntry {
  id: string;
  name: string;
  colorFamily: ColorFamily;
  weight: YarnWeight;
  fiberType: FiberType;
  yardageEstimate: number;
  photoUri?: string;
  addedAt: number;
}
