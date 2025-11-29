import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Field {
  id: number;
  status: 'empty' | 'planted' | 'growing' | 'ready';
  seedType?: string;
  plantedDate?: Date;
  growthStage?: 'seedling' | 'young' | 'mature' | 'ready';
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
  selectedFieldId: number | null = null;
  selectedSeedType: string | null = null;
  sowingDate: string = '';

  seedlingIcon = 'assets/icons/plant.svg';

  get firstEmptyFieldId(): number | null {
    const emptyField = this.fields.find(f => f.status === 'empty');
    return emptyField ? emptyField.id : null;
  }

  hasPlus(fieldId: number): boolean {
    return this.firstEmptyFieldId === fieldId;
  }

  isPlanted(fieldId: number): boolean {
    const field = this.fields.find(f => f.id === fieldId);
    return field ? field.status === 'planted' : false;
  }

  getField(fieldId: number): Field | undefined {
    return this.fields.find(f => f.id === fieldId);
  }

  getPlantIcon(fieldId: number): string {
    const field = this.getField(fieldId);
    if (field && field.status === 'planted') {
      return this.seedlingIcon;
    }
    return '';
  }

  openAddSeedModal(fieldId: number) {
    this.selectedFieldId = fieldId;
    this.selectedSeedType = null;
    this.sowingDate = '';
    this.isModalOpen = true;
  }

  openFieldDetailsModal(fieldId: number) {
    const field = this.getField(fieldId);
    if (field && field.status === 'planted') {
      this.selectedFieldId = fieldId;
      this.isDetailsModalOpen = true;
    }
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
}
