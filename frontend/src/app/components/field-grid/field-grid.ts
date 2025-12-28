import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Field {
  id: number;
  status: 'empty' | 'planted' | 'growing' | 'ready';
  seedType?: string;
  plantedDate?: Date;
  harvestDate?: Date;
  growthStage?: 'seedling' | 'young' | 'mature' | 'ready';
}

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
  fields: Field[] = [
    { id: 1, status: 'empty' },
    { id: 2, status: 'empty' },
    { id: 3, status: 'empty' },
    { id: 4, status: 'empty' },
    { id: 5, status: 'empty' },
    { id: 6, status: 'empty' }
  ];

  isModalOpen = false;
  isDetailsModalOpen = false;
  isHarvestModalOpen = false;
  selectedFieldId: number | null = null;
  selectedSeedType: string | null = null;
  sowingDate: string = '';
  harvestDate: string = '';

  // Developer mode for testing
  devMode = true;

  // Icon mapping
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

  addSeedConfirm() {
    if (!this.selectedSeedType || !this.sowingDate) {
      alert('Please select a seed type and sowing date');
      return;
    }

    if (this.selectedFieldId) {
      const fieldIndex = this.fields.findIndex(f => f.id === this.selectedFieldId);
      if (fieldIndex !== -1) {
        this.fields[fieldIndex] = {
          ...this.fields[fieldIndex],
          status: 'planted',
          seedType: this.selectedSeedType,
          plantedDate: new Date(this.sowingDate),
          growthStage: 'seedling'
        };
      }
    }
    this.closeModal();
  }

  harvestField() {
    if (!this.harvestDate) {
      alert('Please select a harvest date');
      return;
    }

    if (this.selectedFieldId) {
      const field = this.getField(this.selectedFieldId);

      // Validate harvest date is after planting date
      if (field && field.plantedDate) {
        const harvestDateObj = new Date(this.harvestDate);
        if (harvestDateObj < field.plantedDate) {
          alert('Harvest date cannot be before planting date');
          return;
        }
      }

      const fieldIndex = this.fields.findIndex(f => f.id === this.selectedFieldId);
      if (fieldIndex !== -1) {
        this.fields[fieldIndex] = {
          id: this.selectedFieldId,
          status: 'empty'
        };

        alert(`Field ${this.selectedFieldId} harvested successfully!`);
      }
    }

    this.closeHarvestModal();
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

  // ============================================
  // DEVELOPER CONTROLS
  // ============================================

  advanceGrowth(fieldId: number) {
    const field = this.getField(fieldId);
    if (!field || field.status === 'empty') return;

    const fieldIndex = this.fields.findIndex(f => f.id === fieldId);

    if (field.status === 'planted' && field.growthStage === 'seedling') {
      // Move to growing stage
      this.fields[fieldIndex] = {
        ...field,
        status: 'growing',
        growthStage: 'young'
      };
    } else if (field.status === 'growing' && field.growthStage === 'young') {
      // Move to mature
      this.fields[fieldIndex] = {
        ...field,
        growthStage: 'mature'
      };
    } else if (field.status === 'growing' && field.growthStage === 'mature') {
      // Move to ready
      this.fields[fieldIndex] = {
        ...field,
        status: 'ready',
        growthStage: 'ready'
      };
    }
  }

  resetField(fieldId: number) {
    const fieldIndex = this.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex !== -1) {
      this.fields[fieldIndex] = {
        id: fieldId,
        status: 'empty'
      };
    }
  }

  getFieldStatusDisplay(fieldId: number): string {
    const field = this.getField(fieldId);
    if (!field) return '';

    if (field.status === 'empty') return 'Empty';

    return `${field.status} (${field.growthStage}) - ${field.seedType}`;
  }
}
