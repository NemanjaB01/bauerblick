import { Recommendation } from "../models/Recommendation";
import { SoilType } from "../models/SoilType";
import { FieldCreateDto, FieldDetailsDto } from "./field";
import { Field } from "../models/Field";

export class FarmDetailsDto {
    id!: string;
    name!: string;
    latitude!: number;
    longitude!: number;
    soilType!: SoilType;
    fields!: Field[]; // FieldDetailsDto[]; // TODO: Dto
    recommendations!: Recommendation[]; //TODO: Dto
    userId!: string;
}

export class FarmCreateDto {
    name!: string;
    latitude!: number;
    longitude!: number;
    soilType!: SoilType;
    fields!: Field[]; //FieldCreateDto[]; //TODO: Dto
}

export interface FarmCheckResponse {
  hasFarms: boolean;
  farmCount: number;
}
