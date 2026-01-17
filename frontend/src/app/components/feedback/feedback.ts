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

  ngOnInit(): void {
    this.loadFeedbackQuestions();
    this.loadMockData();
  }

  /**
   * Load feedback questions from JSON
   * TODO: Replace with actual API call to load questions
   */
  loadFeedbackQuestions(): void {
    this.feedbackQuestions = [
      {
        id: "timing_urgency",
        question: "Did the irrigation recommendation arrive on time?",
        targetParameter: "urgent_deficit_factor",
        description: "Adjusts how early the system triggers the 'Irrigate Now' alert.",
        options: [
          { label: "Late, plants were already wilting", value: -2, multiplier: 0.90 },
          { label: "Slightly late", value: -1, multiplier: 0.95 },
          { label: "Right on time", value: 0, multiplier: 1.00 },
          { label: "Too early, soil was still moist", value: 1, multiplier: 1.05 },
          { label: "Way too early / Unnecessary", value: 2, multiplier: 1.10 }
        ]
      },
      {
        id: "moisture_perception",
        question: "How did the soil moisture feel to the touch when the alert arrived?",
        targetParameter: "urgent_moisture_factor",
        description: "Adjusts the system's sensitivity to soil moisture sensor readings.",
        options: [
          { label: "Completely dry / Dusty", value: 2, multiplier: 1.10 },
          { label: "Drier than expected", value: 1, multiplier: 1.05 },
          { label: "Expected / Normal", value: 0, multiplier: 1.00 },
          { label: "Wet / Muddy", value: -2, multiplier: 0.90 }
        ]
      },
      {
        id: "plant_health_visual",
        question: "How did the plants look visually before irrigation?",
        targetParameter: "allowedWaterDeficit",
        description: "Adjusts the general water holding capacity allowance for the plant.",
        options: [
          { label: "Lifeless / Yellowing", value: -2, multiplier: 0.90 },
          { label: "Slight wilting", value: -1, multiplier: 0.95 },
          { label: "Healthy and firm", value: 0, multiplier: 1.00 },
          { label: "Lush and green (despite no water)", value: 1, multiplier: 1.05 }
        ]
      },
      {
        id: "general_growth",
        question: "In general, how do you rate the plant growth this season?",
        targetParameter: "seedCoefficient",
        description: "Adjusts the overall water requirement coefficient for the seed.",
        options: [
          { label: "Slow / Stunted growth", value: -1, multiplier: 1.05 },
          { label: "Normal growth", value: 0, multiplier: 1.00 },
          { label: "Too fast / Watery", value: 1, multiplier: 0.95 }
        ]
      }
    ];
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

      // TODO: Replace with actual API call
      // this.feedbackService.submitFeedback(this.selectedHarvest.id, this.userAnswers).subscribe({
      //   next: (response) => {
      //     this.selectedHarvest!.status = 'completed';
      //     this.closeFeedbackModal();
      //   },
      //   error: (error) => console.error('Error submitting feedback:', error)
      // });

      // For now, update locally and save answers
      this.selectedHarvest.feedback = {
        submittedAt: new Date(),
        answers: this.userAnswers
      };
      this.selectedHarvest.status = 'completed';
      this.closeFeedbackModal();

      // Show success message (optional)
      alert('Feedback submitted successfully!');
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
