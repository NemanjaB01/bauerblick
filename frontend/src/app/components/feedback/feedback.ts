import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TopbarComponent } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';
import {FarmService} from '../../services/farm-service/farm-service';
import {take} from 'rxjs/operators';

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
  submittedAt: Date;
  answers: FeedbackAnswer[];
}

interface FeedbackQuestion {
  id: string;
  question: string;
  targetParameter: string;
  description: string;
  options: FeedbackOption[];
}

interface FeedbackOption {
  label: string;
  value: number;
  multiplier: number;
}

interface FeedbackAnswer {
  questionId: string;
  selectedOption: FeedbackOption;
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
  showViewFeedbackModal = false;
  selectedHarvest: HarvestFeedback | null = null;

  // Question-based feedback
  feedbackQuestions: FeedbackQuestion[] = [];
  currentQuestionIndex = 0;
  userAnswers: FeedbackAnswer[] = [];
  selectedOption: FeedbackOption | null = null;
  constructor(private farmService: FarmService) {}

  ngOnInit(): void {
    this.loadFeedbackQuestions();
    // this.loadMockData();
    this.loadRealData();
  }

  /**
   * Load feedback questions from JSON
   * TODO: Replace with actual API call to load questions
   */
  loadFeedbackQuestions(): void {
    this.farmService.getFeedbackQuestions().subscribe({
      next: (data) => {
        this.feedbackQuestions = data;
        console.log('Questions loaded:', this.feedbackQuestions);
      },
      error: (err) => console.error('Could not load feedback questions', err)
    });
  }

  /**
   * Load mock harvest data with question-based feedback
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
          submittedAt: new Date('2024-10-15'),
          answers: [
            {
              questionId: 'timing_urgency',
              selectedOption: this.feedbackQuestions[0].options[2] // "Right on time"
            },
            {
              questionId: 'moisture_perception',
              selectedOption: this.feedbackQuestions[1].options[2] // "Expected / Normal"
            },
            {
              questionId: 'plant_health_visual',
              selectedOption: this.feedbackQuestions[2].options[2] // "Healthy and firm"
            },
            {
              questionId: 'general_growth',
              selectedOption: this.feedbackQuestions[3].options[1] // "Normal growth"
            }
          ]
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
   * Get current question
   */
  getCurrentQuestion(): FeedbackQuestion | null {
    if (this.currentQuestionIndex < this.feedbackQuestions.length) {
      return this.feedbackQuestions[this.currentQuestionIndex];
    }
    return null;
  }

  /**
   * Check if answer was already given for current question
   */
  getPreviousAnswer(): FeedbackOption | null {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return null;

    const previousAnswer = this.userAnswers.find(
      answer => answer.questionId === currentQuestion.id
    );

    return previousAnswer ? previousAnswer.selectedOption : null;
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
   * Open feedback modal for adding new feedback
   */
  openFeedbackModal(harvest: HarvestFeedback): void {
    if (harvest.status === 'ready') {
      this.selectedHarvest = harvest;
      this.showFeedbackModal = true;
      this.currentQuestionIndex = 0;
      this.userAnswers = [];
      this.selectedOption = this.getPreviousAnswer();
    }
  }

  /**
   * View completed feedback (questions and answers)
   */
  viewFeedback(harvest: HarvestFeedback): void {
    if (harvest.status === 'completed' && harvest.feedback) {
      this.selectedHarvest = harvest;
      this.showViewFeedbackModal = true;
    }
  }

  /**
   * Close feedback modals
   */
  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.showViewFeedbackModal = false;
    this.selectedHarvest = null;
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.selectedOption = null;
  }

  /**
   * Select an option for current question
   */
  selectOption(option: FeedbackOption): void {
    this.selectedOption = option;
  }

  /**
   * Check if option is selected
   */
  isOptionSelected(option: FeedbackOption): boolean {
    return this.selectedOption === option;
  }

  /**
   * Save current answer and go to next question
   */
  nextQuestion(): void {
    if (!this.selectedOption) return;

    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return;

    // Save or update answer
    const existingAnswerIndex = this.userAnswers.findIndex(
      answer => answer.questionId === currentQuestion.id
    );

    if (existingAnswerIndex >= 0) {
      this.userAnswers[existingAnswerIndex].selectedOption = this.selectedOption;
    } else {
      this.userAnswers.push({
        questionId: currentQuestion.id,
        selectedOption: this.selectedOption
      });
    }

    // Move to next question
    if (this.currentQuestionIndex < this.feedbackQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedOption = this.getPreviousAnswer();
    } else {
      // Last question - submit
      this.submitFeedback();
    }
  }


  loadRealData(): void {
    this.farmService.selectedFarm$.pipe(take(1)).subscribe(farm => {
      if (farm && farm.id) {

        this.farmService.getHarvestHistory(farm.id).subscribe({
          next: (historyData) => {
            console.log('Harvest History loaded:', historyData);

            const historyHarvests: HarvestFeedback[] = historyData.map(h => {
              const hasFeedback = h.feedbackAnswers && h.feedbackAnswers.length > 0;
              return {
                id: h.id,
                farmName: farm.name,
                cropType: this.formatSeedName(h.seedType),
                cropIcon: this.getIconForSeed(h.seedType),
                harvestDate: new Date(h.harvestDate).toLocaleDateString('en-GB'),
                status: hasFeedback ? 'completed' : 'ready',
                feedback: hasFeedback ? {
                  submittedAt: new Date(),
                  answers: h.feedbackAnswers.map((ans: any) => ({
                    questionId: ans.questionId,
                    selectedOption: {
                      label: ans.answerLabel,
                      value: ans.answerValue,
                      multiplier: ans.multiplier
                    }
                  }))
                } : undefined
              };
            });

            const activeFields: HarvestFeedback[] = (farm.fields || [])
              .filter(f => f.status !== 'EMPTY')
              .map(f => {
                return {
                  id: `field-${f.id}`,
                  farmName: farm.name,
                  cropType: this.formatSeedName(f.seedType || ''),
                  cropIcon: this.getIconForSeed(this.formatSeedName(f.seedType as string)),
                  harvestDate: '',
                  status: 'locked',
                  estimatedHarvest: f.plantedDate ?
                    `Planted: ${new Date(f.plantedDate).toLocaleDateString('en-GB')}` :
                    'Growing...',
                  lockedUntil: 'TBD'
                } as HarvestFeedback;
              });

            this.harvests = [...activeFields, ...historyHarvests];

          },
          error: (err) => console.error('Failed to load harvest history', err)
        });
      }
    });
  }

  private getIconForSeed(seedType: string): string {
    if (!seedType) return 'plant.svg';
    console.log('Seed type:', seedType.toLowerCase());
    switch (seedType.toLowerCase()) {
      case 'wheat':
        return 'wheat.svg';
      case 'corn':
        return 'corn.svg';
      case 'barley':
        return 'barely.svg';
      case 'pumpkin':
        return 'pumpkin.svg';
      case 'white grapes':
        return 'white_grape.svg';
      case 'black grapes':
        return 'grape.svg';


      default:
        return 'plant.svg';
    }
  }

  // Helper za ime
  private formatSeedName(seedType: string): string {
    if (!seedType) return 'Crop';
    return seedType.replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Go to previous question
   */
  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.selectedOption = this.getPreviousAnswer();
    }
  }

  /**
   * Check if we're on first question
   */
  isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  /**
   * Check if we're on last question
   */
  isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.feedbackQuestions.length - 1;
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.feedbackQuestions.length) * 100;
  }

  /**
   * Submit feedback to backend
   */
  submitFeedback(): void {
    if (this.selectedHarvest && this.selectedHarvest.status === 'ready') {
      console.log('Submitting feedback:', {
        harvestId: this.selectedHarvest.id,
        answers: this.userAnswers
      });

      const answersToSend = this.userAnswers.map(ans => ({
        questionId: ans.questionId,
        selectedOption: {
          label: ans.selectedOption.label,
          value: ans.selectedOption.value,
          multiplier: ans.selectedOption.multiplier
        }
      }));

      this.farmService.submitFeedback(this.selectedHarvest.id, answersToSend).subscribe({
        next: () => {
          // Ažuriraj UI nakon uspjeha
          this.selectedHarvest!.status = 'completed';
          this.selectedHarvest!.feedback = {
            submittedAt: new Date(),
            answers: this.userAnswers
          };

          this.closeFeedbackModal();
          alert('Feedback submitted successfully!');
        },
        error: (err) => {
          console.error('Error submitting feedback', err);
          alert('Failed to submit feedback. Try again.');
        }
      });
    }
  }

  /**
   * Get questions and answers for viewing feedback
   */
  getQuestionsAndAnswers(): Array<{question: string, answer: string}> {
    if (!this.selectedHarvest?.feedback?.answers) {
      return [];
    }

    return this.selectedHarvest.feedback.answers.map(answer => {
      const question = this.feedbackQuestions.find(q => q.id === answer.questionId);
      return {
        question: question?.question || 'Unknown question',
        answer: answer.selectedOption.label
      };
    });
  }
}
