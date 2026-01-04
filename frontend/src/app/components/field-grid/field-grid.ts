import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FarmService } from '../../services/farm-service/farm-service';
import { FieldUpdateDto } from '../../dtos/field';
import { FieldStatus } from '../../models/FieldStatus';
import { SeedType } from '../../models/Seed';
import { GrowthStage } from '../../models/GrowthStage';
import { Field } from '../../models/Field';


interface GrowthStageIcons {
  seedling: string;
  young: string;
  mature: string;
  ready: string;
}

interface SeedIconMap {
  [seedType: string]: GrowthStageIcons;
}

@Component({
  selector: 'app-field-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-grid.html',
  styleUrl: './field-grid.css',
})
export class FieldGrid {
  fields: Field[] = [];

  isModalOpen = false;
  isDetailsModalOpen = false;
  isHarvestModalOpen = false;
  selectedFieldId: number | null = null;
  selectedSeedType: string | null = null;
  sowingDate: string = '';
  harvestDate: string = '';


constructor(private farmService: FarmService, private toastr: ToastrService) {
  this.farmService.selectedFarm$.subscribe(farm => {
    this.fields = farm?.fields || [];
    console.log(this.fields);
  });
}
  
  devMode = false;

  seedIcons: SeedIconMap = {
    wheat: {
      seedling: 'assets/icons/plant.svg',
      young: 'assets/icons/wheat_growing.svg',
      mature: 'assets/icons/wheat_growing.svg',
      ready: 'assets/icons/wheat_ready.svg'
    },
    corn: {
      seedling: 'assets/icons/plant.svg',
      young: 'assets/icons/corn_growing.svg',
      mature: 'assets/icons/corn_growing.svg',
      ready: 'assets/icons/corn_ready.svg'
    },
    barley: {
      seedling: 'assets/icons/plant.svg',
      young: 'assets/icons/barely_growing.svg',
      mature: 'assets/icons/barely_growing.svg',
      ready: 'assets/icons/barely_ready.svg'
    },
    white_grape: {
      seedling: 'assets/icons/plant.svg',
      young: 'assets/icons/black_grape_growing.svg',
      mature: 'assets/icons/black_grape_growing.svg',
      ready: 'assets/icons/white_grape_ready.svg'
    },
    red_grape: {
      seedling: 'assets/icons/plant.svg',
      young: 'assets/icons/black_grape_growing.svg',
      mature: 'assets/icons/black_grape_growing.svg',
      ready: 'assets/icons/black_grape_ready.svg'
    },
    pumpkin: {
      seedling: 'assets/icons/plant.svg',
      young: 'assets/icons/pumpkin_growing.svg',
      mature: 'assets/icons/pumpkin_growing.svg',
      ready: 'assets/icons/pumpkin_ready.svg'
    }
  };

  // ============================================
  // VALIDATION METHODS
  // ============================================

  private validateSeedSelection(): { valid: boolean; message?: string; title?: string } {
    if (!this.selectedSeedType) {
      return {
        valid: false,
        message: 'Please select a seed type to plant',
        title: 'Seed Type Missing'
      };
    }
    return { valid: true };
  }

  private validateSowingDate(dateString: string): { valid: boolean; message?: string; title?: string } {
    if (!dateString || dateString.trim() === '') {
      return {
        valid: false,
        message: 'Please select a sowing date before planting',
        title: 'Date Missing'
      };
    }

    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      return {
        valid: false,
        message: 'The selected date is invalid. Please choose a valid date',
        title: 'Invalid Date'
      };
    }

    if (selectedDate > today) {
      return {
        valid: false,
        message: 'Sowing date cannot be in the future',
        title: 'Future Date'
      };
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (selectedDate < oneYearAgo) {
      return {
        valid: false,
        message: 'Sowing date cannot be more than 1 year in the past',
        title: 'Date Too Old'
      };
    }

    return { valid: true };
  }

  private validateHarvestDate(
    harvestDateString: string,
    plantedDate?: Date
  ): { valid: boolean; message?: string; title?: string } {
    if (!harvestDateString || harvestDateString.trim() === '') {
      return {
        valid: false,
        message: 'Please select a harvest date',
        title: 'Date Missing'
      };
    }

    const harvestDate = new Date(harvestDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(harvestDate.getTime())) {
      return {
        valid: false,
        message: 'The selected harvest date is invalid',
        title: 'Invalid Date'
      };
    }

    if (plantedDate) {
      const plantedDateOnly = new Date(plantedDate);
      plantedDateOnly.setHours(0, 0, 0, 0);

      if (harvestDate < plantedDateOnly) {
        const plantedDateStr = plantedDate.toLocaleDateString();
        return {
          valid: false,
          message: `Harvest date cannot be before planting date (${plantedDateStr})`,
          title: 'Invalid Date Range'
        };
      }

      if (harvestDate.getTime() === plantedDateOnly.getTime()) {
        return {
          valid: false,
          message: 'Harvest date cannot be the same as planting date',
          title: 'Too Soon'
        };
      }
    }

    if (harvestDate > today) {
      return {
        valid: false,
        message: 'Harvest date cannot be in the future',
        title: 'Future Date'
      };
    }

    return { valid: true };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  get firstEmptyFieldId(): number | null {
    const emptyField = this.fields.find(f => f.status === 'empty');
    return emptyField ? emptyField.id : null;
  }

  hasPlus(fieldId: number): boolean {
    return this.firstEmptyFieldId === fieldId;
  }

  isPlanted(fieldId: number): boolean {
    const field = this.fields.find(f => f.id === fieldId);
    return field ? field.status !== 'empty' : false;
  }

  isReady(fieldId: number): boolean {
    const field = this.fields.find(f => f.id === fieldId);
    return field ? field.status === 'ready' : false;
  }

  getField(fieldId: number): Field | undefined {
    return this.fields.find(f => f.id === fieldId);
  }

  getPlantIcon(fieldId: number): string {
    const field = this.getField(fieldId);

    if (!field || field.status === 'empty' || !field.seedType) {
      return '';
    }

    const seedType = field.seedType;
    const growthStage = field.growthStage || 'seedling';

    if (this.seedIcons[seedType] && this.seedIcons[seedType][growthStage]) {
      return this.seedIcons[seedType][growthStage];
    }

    return 'assets/icons/plant.svg';
  }

  getSelectedField(): Field | undefined {
    if (this.selectedFieldId) {
      return this.getField(this.selectedFieldId);
    }
    return undefined;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getFieldStatusDisplay(fieldId: number): string {
    const field = this.getField(fieldId);
    if (!field) return '';

    if (field.status === 'empty') return 'Empty';

    return `${field.status} (${field.growthStage}) - ${field.seedType}`;
  }

  // ============================================
  // MODAL METHODS
  // ============================================

  openAddSeedModal(fieldId: number) {
    this.selectedFieldId = fieldId;
    this.selectedSeedType = null;
    this.sowingDate = '';
    this.isModalOpen = true;
  }

  openFieldDetailsModal(fieldId: number) {
    const field = this.getField(fieldId);

    if (field && field.status === 'ready') {
      this.openHarvestModal(fieldId);
      return;
    }

    if (field && field.status !== 'empty') {
      this.selectedFieldId = fieldId;
      this.isDetailsModalOpen = true;
    }
  }

  openHarvestModal(fieldId: number) {
    this.selectedFieldId = fieldId;
    this.harvestDate = new Date().toISOString().split('T')[0];
    this.isHarvestModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedFieldId = null;
    this.selectedSeedType = null;
    this.sowingDate = '';
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedFieldId = null;
  }

  closeHarvestModal() {
    this.isHarvestModalOpen = false;
    this.selectedFieldId = null;
    this.harvestDate = '';
  }

  selectSeedType(seedType: string) {
    this.selectedSeedType = seedType;
  }

  // ============================================
  // FIELD ACTIONS WITH VALIDATION
  // ============================================

  addSeedConfirm() {
    // Validate seed type
    const seedValidation = this.validateSeedSelection();
    if (!seedValidation.valid) {
      this.toastr.warning(seedValidation.message!, seedValidation.title!);
      return;
    }

    // Validate sowing date
    const dateValidation = this.validateSowingDate(this.sowingDate);
    if (!dateValidation.valid) {
      this.toastr.error(dateValidation.message!, dateValidation.title!);
      return;
    }

    // All validations passed - plant the field
    if (this.selectedFieldId) {
      const fieldIndex = this.fields.findIndex(f => f.id === this.selectedFieldId);
      if (fieldIndex !== -1) {
        // this.fields[fieldIndex] = {
        //   ...this.fields[fieldIndex],
        //   status: 'planted',
        //   seedType: this.selectedSeedType!,
        //   plantedDate: new Date(this.sowingDate),
        //   growthStage: 'seedling'
        // };

        const fieldUpdate = {
          id: this.selectedFieldId,
          status: 'planted',
          seedType: this.selectedSeedType!,
          plantedDate: new Date(this.sowingDate),
          growthStage: GrowthStage.Seedling
        };

        this.farmService.updateField(fieldUpdate)?.subscribe();
        this.farmService.loadFarms().subscribe();

        // Success notification
        // @ts-ignore
        const seedName = this.selectedSeedType.replace('_', ' ');
        this.toastr.success(
          `${seedName.charAt(0).toUpperCase() + seedName.slice(1)} planted successfully`,
          `Field ${this.selectedFieldId} Planted`
        );
      }
    }
    this.closeModal();
  }

  harvestField() {
    if (this.selectedFieldId) {
      const field = this.getField(this.selectedFieldId);

      // Validate harvest date
      const dateValidation = this.validateHarvestDate(this.harvestDate, field?.plantedDate);
      if (!dateValidation.valid) {
        this.toastr.error(dateValidation.message!, dateValidation.title!);
        return;
      }

      // All validations passed - harvest the field
      const fieldIndex = this.fields.findIndex(f => f.id === this.selectedFieldId);
      if (fieldIndex !== -1 && field) {
        const cropType = field.seedType;
        const cropName = cropType?.replace('_', ' ');

        this.fields[fieldIndex] = {
          id: this.selectedFieldId,
          status: 'empty'
        };

        // Success notification
        this.toastr.success(
          `${cropName?.charAt(0).toUpperCase()}${cropName?.slice(1)} harvested successfully`,
          `Field ${this.selectedFieldId} Harvested`
        );
      }
    }

    this.closeHarvestModal();
  }

  // ============================================
  // DEVELOPER CONTROLS
  // ============================================

  advanceGrowth(fieldId: number) {
    const field = this.getField(fieldId);
    if (!field || field.status === 'empty') return;

    const fieldIndex = this.fields.findIndex(f => f.id === fieldId);

    if (field.status === 'planted' && field.growthStage === 'seedling') {
      this.fields[fieldIndex] = {
        ...field,
        status: 'growing',
        growthStage: 'young'
      };
      this.toastr.info(`Field ${fieldId} is now growing`, 'Growth Stage: Young');

    } else if (field.status === 'growing' && field.growthStage === 'young') {
      this.fields[fieldIndex] = {
        ...field,
        growthStage: 'mature'
      };
      this.toastr.info(`Field ${fieldId} is maturing`, 'Growth Stage: Mature');

    } else if (field.status === 'growing' && field.growthStage === 'mature') {
      this.fields[fieldIndex] = {
        ...field,
        status: 'ready',
        growthStage: 'ready'
      };
      const cropName = field.seedType?.replace('_', ' ');
      this.toastr.success(
        `${cropName?.charAt(0).toUpperCase()}${cropName?.slice(1)} is ready to harvest`,
        `Field ${fieldId} Ready`
      );
    }
  }

  resetField(fieldId: number) {
    const field = this.getField(fieldId);
    const fieldIndex = this.fields.findIndex(f => f.id === fieldId);

    if (fieldIndex !== -1 && field && field.status !== 'empty') {
      const cropName = field.seedType?.replace('_', ' ');

      this.fields[fieldIndex] = {
        id: fieldId,
        status: 'empty'
      };

      this.toastr.info(
        `${cropName ? cropName.charAt(0).toUpperCase() + cropName.slice(1) + ' removed. ' : ''}Field is now empty`,
        `Field ${fieldId} Reset`
      );
    }
  }
}
