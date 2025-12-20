import { Field } from "../models/Field";
import { Recommendation } from "../models/Recommendation";
import { SoilType } from "../models/SoilType";

export class FarmCreateDto {
    name!: string;
    latitude!: number;
    longitude!: number;
    soilType!: SoilType;
    fields!: Field[]; //TODO: Change to dto
    recommendations!: Recommendation[];
    email!: string;
}
