import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RecommendationData {
  id: string;
  userId: string;
  farmId: string;
  recommendedSeed: string;
  recommendationType: string;
  advice: string;
  reasoning: string;
  weatherTimestamp: string;
  metrics: {
    temperature?: number;
    deficit_amount?: number;
    [key: string]: any;
  };
  receivedAt?: Date;
}

interface RecommendationTypeInfo {
  icon: string;
  color: string;
  label: string;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.css',
})
export class Recommendations implements OnInit, OnDestroy {
  recommendations: RecommendationData[] = [];
  currentRecommendationIndex = 0;
  isModalOpen = false;

  ngOnInit() {
    // Load mock data for testing
    this.loadMockData();

    // TODO: For WebSocket, uncomment this and inject the service:
    // constructor(private recommendationsService: RecommendationsWebSocketService) {}
    //
    // this.recommendationsSubscription = this.recommendationsService.getRecommendationUpdates().subscribe({
    //   next: (data: RecommendationData) => {
    //     console.log('New recommendation received:', data);
    //   }
    // });
    //
    // this.listSubscription = this.recommendationsService.getAllRecommendations().subscribe({
    //   next: (recommendations: RecommendationData[]) => {
    //     this.recommendations = recommendations;
    //   }
    // });
  }

  ngOnDestroy() {
    // TODO: Add WebSocket cleanup when implemented
    // if (this.recommendationsSubscription) {
    //   this.recommendationsSubscription.unsubscribe();
    // }
    // if (this.listSubscription) {
    //   this.listSubscription.unsubscribe();
    // }
  }

  /**
   * Load mock recommendations for testing
   * Remove this method when switching to WebSocket
   */
  private loadMockData(): void {
    const mockRecommendations: RecommendationData[] = [
      {
        id: "51284550-09c9-49b3-a792-13bab24db584",
        userId: "user-3",
        farmId: "farm-3-a",
        recommendedSeed: "CORN",
        recommendationType: "FROST_ALERT",
        advice: "CHECK_GROWING_POINT_RECOVERY",
        reasoning: "Temperature (1.95°C) below frost risk threshold (2.0°C)",
        weatherTimestamp: "2025-12-03T15:45:00",
        metrics: {
          temperature: 1.95
        },
        receivedAt: new Date(Date.now() - 10 * 60000) // 10 minutes ago
      },
      {
        id: "df02c534-94eb-4199-9e61-2daea87831da",
        userId: "user-1",
        farmId: "farm-1-a",
        recommendedSeed: "WHEAT",
        recommendationType: "MONITOR_CONDITIONS",
        advice: "No Irrigation Needed for Wheat",
        reasoning: "Conditions optimal. Water Surplus. Forecasted rain exceeds crop needs by 6.8 mm. Moisture: 26.2%",
        weatherTimestamp: "2025-12-03T16:45:59.365024398",
        metrics: {
          temperature: 6.5193140123571665,
          deficit_amount: -6.753635313364793
        },
        receivedAt: new Date(Date.now() - 5 * 60000) // 5 minutes ago
      },
      {
        id: "abc2c534-94eb-4199-9e61-2daea87831da",
        userId: "user-1",
        farmId: "farm-1-a",
        recommendedSeed: "RED_GRAPE",
        recommendationType: "IRRIGATE_NOW",
        advice: "Irrigation Needed for the Red Grape",
        reasoning: "To sunny today. Water Surplus. Forecasted rain decreased crop needs by 6.8 mm. Moisture: 26.2%",
        weatherTimestamp: "2025-12-03T16:45:59.365024398",
        metrics: {
          temperature: 6.5193140123571665,
          deficit_amount: -6.753635313364793
        },
        receivedAt: new Date(Date.now() - 5 * 60000) // 5 minutes ago
      }
    ];

    this.recommendations = mockRecommendations;
  }

  /**
   * Add a new recommendation (for testing)
   * This simulates receiving data from WebSocket
   */
  addTestRecommendation(): void {
    const newRec: RecommendationData = {
      id: 'test-' + Date.now(),
      userId: 'user-1',
      farmId: 'farm-1-b',
      recommendedSeed: 'BARLEY',
      recommendationType: 'IRRIGATION_NEEDED',
      advice: 'Immediate Irrigation Required',
      reasoning: 'Soil moisture critically low. Temperature rising. Water deficit detected.',
      weatherTimestamp: new Date().toISOString(),
      metrics: {
        temperature: 28.5,
        deficit_amount: 15.2
      },
      receivedAt: new Date()
    };

    this.recommendations.push(newRec);
  }

  /**
   * Format seed name: remove underscores and capitalize properly
   */
  formatSeedName(seedName: string | undefined): string {
    if (!seedName) return '';

    let formatted = seedName.replace(/_/g, ' ');

    formatted = formatted.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return formatted;
  }
  /**
   * Get the count of recommendations
   */
  getRecommendationsCount(): number {
    return this.recommendations.length;
  }

  /**
   * Check if there are any recommendations
   */
  hasRecommendations(): boolean {
    return this.recommendations.length > 0;
  }

  /**
   * Open the details modal
   */
  openModal(): void {
    if (this.hasRecommendations()) {
      this.currentRecommendationIndex = 0;
      this.isModalOpen = true;
    }
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * Get current recommendation being displayed
   */
  getCurrentRecommendation(): RecommendationData | null {
    if (this.recommendations.length === 0) return null;
    return this.recommendations[this.currentRecommendationIndex];
  }

  /**
   * Navigate to next recommendation
   */
  nextRecommendation(): void {
    if (this.currentRecommendationIndex < this.recommendations.length - 1) {
      this.currentRecommendationIndex++;
    }
  }

  /**
   * Navigate to previous recommendation
   */
  previousRecommendation(): void {
    if (this.currentRecommendationIndex > 0) {
      this.currentRecommendationIndex--;
    }
  }

  /**
   * Check if there's a next recommendation
   */
  hasNext(): boolean {
    return this.currentRecommendationIndex < this.recommendations.length - 1;
  }

  /**
   * Check if there's a previous recommendation
   */
  hasPrevious(): boolean {
    return this.currentRecommendationIndex > 0;
  }

  /**
   * Get seed icon path
   */
  getSeedIcon(seedType: string): string {
    const seed = seedType.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'wheat': 'assets/icons/wheat.svg',
      'corn': 'assets/icons/corn.svg',
      'barley': 'assets/icons/barely.svg',
      'white_grape': 'assets/icons/white_grape.svg',
      'red_grape': 'assets/icons/grape.svg',
      'grape': 'assets/icons/grape.svg',
      'pumpkin': 'assets/icons/pumpkin.svg'
    };

    return iconMap[seed] || 'assets/icons/wheat.svg';
  }

  /**
   * Get recommendation type information (icon, color, label)
   */
  getRecommendationTypeInfo(type: string): RecommendationTypeInfo {
    const typeMap: { [key: string]: RecommendationTypeInfo } = {
      'FROST_ALERT': {
        icon: '❄️',
        color: '#3B82F6',
        label: 'Frost Alert'
      },
      'MONITOR_CONDITIONS': {
        icon: '👁️',
        color: '#10B981',
        label: 'Monitor Conditions'
      },
      'IRRIGATION_NEEDED': {
        icon: '💧',
        color: '#0EA5E9',
        label: 'Irrigation Needed'
      },
      'IRRIGATE_NOW': {
        icon: '💧',
        color: '#0EA5E9',
        label: 'Irrigate Now'
      },
      'HARVEST_READY': {
        icon: '🌾',
        color: '#F59E0B',
        label: 'Harvest Ready'
      },
      'PEST_WARNING': {
        icon: '🐛',
        color: '#EF4444',
        label: 'Pest Warning'
      },
      'FERTILIZER_RECOMMENDATION': {
        icon: '🌱',
        color: '#22C55E',
        label: 'Fertilizer Recommendation'
      },
      'WEATHER_WARNING': {
        icon: '⚠️',
        color: '#F97316',
        label: 'Weather Warning'
      },
      'HEAT_ALERT': {
        icon: '🌡️',
        color: '#EF4444',
        label: 'Heat Alert'
      },
      'CONTINUE_NORMAL': {
        icon: '✅',
        color: '#10B981',
        label: 'Continue Normal'
      },
      'SAFETY_ALERT': {
        icon: '⚠️',
        color: '#EF4444',
        label: 'Safety Alert'
      },
      'DELAY_OPERATIONS': {
        icon: '⏸️',
        color: '#F97316',
        label: 'Delay Operations'
      }
    };

    return typeMap[type] || {
      icon: 'ℹ️',
      color: '#6B7280',
      label: 'General Recommendation'
    };
  }

  /**
   * Get farmer warning icon based on recommendation type
   */
  getRecommendationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'FROST_ALERT': 'assets/icons/frozen_farmer.svg',
      'HEAT_ALERT': 'assets/icons/heated_farmer.svg',
      'CONTINUE_NORMAL': 'assets/icons/happy_farmer.svg',
      'MONITOR_CONDITIONS': 'assets/icons/monitoring_farmer.svg',
      'SAFETY_ALERT': 'assets/icons/alert_farmer.svg',
      'DELAY_OPERATIONS': 'assets/icons/farmer-delay.svg',
      'IRRIGATE_NOW': 'assets/icons/farmer_irrigate.svg',
      'IRRIGATION_NEEDED': 'assets/icons/farmer_irrigate.svg',
      'RAIN_ALERT': 'assets/icons/rainy_farmer.svg',
    };

    // Default to safety alert icon if icon not found
    return iconMap[type] || 'assets/icons/alert_farmer.svg';
  }

  /**
   * Format advice title: replace underscores with spaces and add exclamation
   */
  formatAdviceTitle(advice: string): string {
    if (!advice) return '';

    let formatted = advice.replace(/_/g, ' ');

    formatted = formatted.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return formatted;
  }

  /**
   * Calculate time since recommendation was received
   */
  getTimeSince(recommendation: RecommendationData): string {
    if (!recommendation.receivedAt) return 'Just now';

    const now = new Date();
    const received = new Date(recommendation.receivedAt);
    const diffMs = now.getTime() - received.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Format temperature if available
   */
  formatTemperature(temp?: number): string {
    if (temp === undefined) return 'N/A';
    return `${temp.toFixed(1)}°C`;
  }

  /**
   * Clear all recommendations
   */
  clearAllRecommendations(): void {
    this.recommendations = [];
    this.closeModal();

    // TODO: When using WebSocket service:
    // this.recommendationsService.clearRecommendations();
  }

  /**
   * Delete current recommendation
   */
  deleteCurrentRecommendation(): void {
    const current = this.getCurrentRecommendation();
    if (current) {
      this.recommendations = this.recommendations.filter(r => r.id !== current.id);

      if (this.currentRecommendationIndex >= this.recommendations.length && this.recommendations.length > 0) {
        this.currentRecommendationIndex = this.recommendations.length - 1;
      }

      if (this.recommendations.length === 0) {
        this.closeModal();
      }

      // TODO: When using WebSocket service:
      // this.recommendationsService.removeRecommendation(current.id);
    }
  }
}
