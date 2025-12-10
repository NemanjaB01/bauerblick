
export type SeedType =
  | 'WHEAT'
  | 'CORN'
  | 'BARLEY'
  | 'PUMPKIN'
  | 'BLACK_GRAPES'
  | 'WHITE_GRAPES';

export interface Seed {
  id: string;
  seedType: SeedType;
  displayName: string;
  scientificName: string;

  minTemperature: number;
  optimalTemperature: number;
  maxTemperature: number;

  minSoilMoisture: number;
  optimalSoilMoisture: number;
  maxSoilMoisture: number;

  waterRequirement: number;

  frostRiskTemperature: number;
  heatStressTemperature: number;
  heavyRainThreshold: number;

  icon?: string; 
}
