import { FieldStatus } from "../models/FieldStatus";
import { GrowthStage } from "../models/GrowthStage";
import { SeedType } from "../models/Seed";

export class FieldDetailsDto {
  id!: number;
  status!: string; //TODO: enum / type
  seedType?: string; //TODO: enum / type
  plantedDate?: Date;
  harvestDate?: Date;
  growthStage?: GrowthStage;
}

export class FieldUpdateDto {
  id!: number;
  status!: string; //TODO: enum / type
  seedType!: string; //TODO: enum / type
  plantedDate!: Date;
  growthStage?: GrowthStage;
}

export class FieldCreateDto {
  id!: number;
  status: FieldStatus = 0; // Default to Empty
}
