import { FieldStatus } from "./FieldStatus";
import { GrowthStage } from "./GrowthStage";
import { SeedType } from "./Seed";

export class Field {
  id!: number;
  status!: 'empty' | 'planted' | 'growing' | 'ready'; //TODO: enum / type
  seedType?: string; //TODO: enum / type
  plantedDate?: Date;
  growthStage?: 'seedling' | 'young' | 'mature' | 'ready'; //TODO: enum / type
  harvestDate?: Date;
}
