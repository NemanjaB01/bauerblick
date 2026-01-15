import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TopbarComponent } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';

interface HarvestFeedback {
  id: string;
  farmName: string;
  cropType: string;
  cropIcon: string;
  harvestDate: string;
  status: 'locked' | 'ready' | 'completed';
  estimatedHarvest?: string;
  lockedUntil?: string;
  feedback?: FeedbackDetails;
}

interface FeedbackDetails {
  seedQuality: number;
  irrigation: number;
  appRecommendations: number;
  overallExperience: number;
  comment?: string;
  submittedAt?: Date;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopbarComponent,
    Sidebar,
  ],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class Feedback implements OnInit {
  harvests: HarvestFeedback[] = [];
  showFeedbackModal = false;
  selectedHarvest: HarvestFeedback | null = null;

  // Rating values for the modal
  seedQuality = 0;
  irrigation = 0;
  appRecommendations = 0;
  overallExperience = 0;
  comment = '';

  ngOnInit(): void {
    this.loadMockData();
  }

  /**
   * Load mock data - replace later with  API call
   */
  loadMockData(): void {
    this.harvests = [
      {
        id: '1',
        farmName: 'Farm 1',
        cropType: 'Grape',
        cropIcon: 'grape.svg',
        harvestDate: 'dd/mm/yyyy',
        status: 'ready'
      },
      {
        id: '2',
        farmName: 'Farm 1',
        cropType: 'Barley',
        cropIcon: 'barely.svg',
        harvestDate: 'dd/mm/yyyy',
        status: 'completed',
        feedback: {
          seedQuality: 4,
          irrigation: 3,
          appRecommendations: 5,
          overallExperience: 4,
          comment: 'Great harvest this season!',
          submittedAt: new Date('2024-10-15')
        }
      },
      {
        id: '3',
        farmName: 'Farm 2',
        cropType: 'Wheat',
        cropIcon: 'wheat.svg',
        harvestDate: 'dd/mm/yyyy',
        status: 'locked',
        estimatedHarvest: 'dd/mm/yyyy',
        lockedUntil: 'dd/mm/yyyy'
      }
    ];
  }

  /**
   * Get CSS class for card based on status
   */
  getCardClass(status: string): string {
    switch(status) {
      case 'ready': return 'harvest-card harvest-ready';
      case 'completed': return 'harvest-card harvest-completed';
      case 'locked': return 'harvest-card harvest-locked';
      default: return 'harvest-card';
    }
  }

  /**
   * Open feedback modal for ready harvests
   */
  openFeedbackModal(harvest: HarvestFeedback): void {
    if (harvest.status === 'ready') {
      this.selectedHarvest = harvest;
      this.showFeedbackModal = true;
      this.resetRatings();
    }
  }

  /**
   * View feedback for completed harvests
   */
  viewFeedback(harvest: HarvestFeedback): void {
    if (harvest.status === 'completed' && harvest.feedback) {
      this.selectedHarvest = harvest;
      this.seedQuality = harvest.feedback.seedQuality;
      this.irrigation = harvest.feedback.irrigation;
      this.appRecommendations = harvest.feedback.appRecommendations;
      this.overallExperience = harvest.feedback.overallExperience;
      this.comment = harvest.feedback.comment || '';
      this.showFeedbackModal = true;
    }
  }

  /**
   * Close feedback modal
   */
  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.selectedHarvest = null;
    this.resetRatings();
  }

  /**
   * Reset all rating values
   */
  resetRatings(): void {
    this.seedQuality = 0;
    this.irrigation = 0;
    this.appRecommendations = 0;
    this.overallExperience = 0;
    this.comment = '';
  }

  /**
   * Set rating for a specific category
   */
  setRating(category: string, rating: number): void {
    if (this.selectedHarvest?.status === 'completed') return;

    switch(category) {
      case 'seedQuality':
        this.seedQuality = rating;
        break;
      case 'irrigation':
        this.irrigation = rating;
        break;
      case 'appRecommendations':
        this.appRecommendations = rating;
        break;
      case 'overallExperience':
        this.overallExperience = rating;
        break;
    }
  }

  /**
   * Submit feedback to backend
   */
  submitFeedback(): void {
    if (this.selectedHarvest && this.selectedHarvest.status === 'ready') {
      const feedback: FeedbackDetails = {
        seedQuality: this.seedQuality,
        irrigation: this.irrigation,
        appRecommendations: this.appRecommendations,
        overallExperience: this.overallExperience,
        comment: this.comment,
        submittedAt: new Date()
      };

      console.log('Submitting feedback:', feedback);

      // TODO: Replace with actual API call
      // this.feedbackService.submitFeedback(this.selectedHarvest.id, feedback).subscribe({
      //   next: (response) => {
      //     this.selectedHarvest!.status = 'completed';
      //     this.selectedHarvest!.feedback = feedback;
      //     this.closeFeedbackModal();
      //   },
      //   error: (error) => console.error('Error submitting feedback:', error)
      // });

      // For now, update locally
      this.selectedHarvest.status = 'completed';
      this.selectedHarvest.feedback = feedback;
      this.closeFeedbackModal();
    }
  }

  /**
   * Check if feedback is read-only (completed status)
   */
  isReadOnly(): boolean {
    return this.selectedHarvest?.status === 'completed';
  }

  /**
   * Get array for star rendering
   */
  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }
}
