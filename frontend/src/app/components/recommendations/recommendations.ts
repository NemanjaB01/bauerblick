import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Subscription} from 'rxjs';
import { take } from 'rxjs/operators';
import { RecommendationsWebSocketService, RecommendationData, ConnectionStatus } from '../../services/websocket-service/recommendations-websocket.service';
import { UserService } from '../../services/user-service/user-service';
import { FarmService } from '../../services/farm-service/farm-service';

import { Farm } from '../../models/Farm';


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

  connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;

  private userId: string | null = null;
  private currentFarm: Farm | null = null;


  private recommendationsSubscription?: Subscription;
  private listSubscription?: Subscription;
  private statusSubscription?: Subscription;
  private mainSubscription?: Subscription;

  constructor(
    private recommendationsService: RecommendationsWebSocketService,
    private userService: UserService,
    private farmService: FarmService
  ) {}

  ngOnInit() {
    this.setupWebSocketSubscriptions();
    this.initializeDataStream();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
    this.disconnectWebSocket();
  }

  private initializeDataStream() {
    this.userService.getProfile().pipe(
      take(1)
    ).subscribe({
      next: (userProfile) => {
        const uniqueId =  userProfile.email;

        if (uniqueId) {
          this.userId = uniqueId;
          console.log('Recommendations: User identified:', this.userId);

          this.subscribeToFarmChanges();
        } else {
          console.error('Recommendations: Could not load User Identifier');
        }
      },
      error: (err) => {
        console.error('Recommendations: Failed to fetch profile', err);
      }
    });
  }

  private subscribeToFarmChanges() {
    this.mainSubscription = this.farmService.selectedFarm$.subscribe(farm => {
      if (farm && farm.id) {
        console.log('Recommendations: Farm changed to', farm.name);

        if (this.currentFarm && this.currentFarm.id !== farm.id) {
          this.recommendationsService.disconnect();
          this.recommendationsService.clearRecommendations();
          this.recommendations = [];
          this.closeModal();
        }

        this.currentFarm = farm;
        this.connectWebSocket();
      } else {
        console.log('Recommendations: No farm selected');
        this.recommendationsService.disconnect();
        this.recommendations = [];
        this.closeModal();
      }
    });
  }

  private setupWebSocketSubscriptions(): void {
    this.recommendationsSubscription = this.recommendationsService.getRecommendationUpdates().subscribe({
      next: (data: RecommendationData) => {
        if (this.currentFarm && data.farmId === this.currentFarm.id) {
          console.log('New recommendation received for current farm:', data);
        }
      },
      error: (error) => console.error('Error in recommendation updates:', error)
    });

    this.listSubscription = this.recommendationsService.getAllRecommendations().subscribe({
      next: (recommendations: RecommendationData[]) => {
        if (this.currentFarm) {
          this.recommendations = recommendations.filter(r => r.farmId === this.currentFarm?.id);
        } else {
          this.recommendations = [];
        }

        console.log('Recommendations list updated:', this.recommendations.length);

        if (this.isModalOpen && this.currentRecommendationIndex >= this.recommendations.length) {
          this.currentRecommendationIndex = Math.max(0, this.recommendations.length - 1);
        }
      },
      error: (error) => console.error('Error in recommendations list:', error)
    });

    this.statusSubscription = this.recommendationsService.getConnectionStatus().subscribe({
      next: (status: ConnectionStatus) => {
        this.connectionStatus = status;
        console.log('Recommendations connection status:', status);

        if (status === ConnectionStatus.DISCONNECTED && this.userId && this.currentFarm) {
          setTimeout(() => {
            if (this.connectionStatus === ConnectionStatus.DISCONNECTED) {
              this.reconnectWebSocket();
            }
          }, 5000);
        }
      },
      error: (error) => console.error('Error in connection status:', error)
    });
  }

  private connectWebSocket(): void {
    if (!this.userId || !this.currentFarm) return;

    console.log(`Connecting recommendations for user ${this.userId}, farm ${this.currentFarm.id}`);

    try {
      this.recommendationsService.setFarmForUser(this.userId, this.currentFarm.id);
    } catch (error) {
      console.error('Error connecting recommendations WebSocket:', error);
    }
  }

  private reconnectWebSocket(): void {
    console.log('Reconnecting recommendations WebSocket...');
    this.recommendationsService.reconnect();
  }

  private disconnectWebSocket(): void {
    this.recommendationsService.disconnect();
  }

  private cleanupSubscriptions(): void {
    if (this.recommendationsSubscription) this.recommendationsSubscription.unsubscribe();
    if (this.listSubscription) this.listSubscription.unsubscribe();
    if (this.statusSubscription) this.statusSubscription.unsubscribe();
    if (this.mainSubscription) this.mainSubscription.unsubscribe();
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
   * Clear all recommendations
   */
  clearAllRecommendations(): void {
    this.recommendationsService.clearRecommendations();
    this.recommendations = [];
    this.closeModal();
  }

  /**
   * Delete current recommendation
   */
  deleteCurrentRecommendation(): void {
    const current = this.getCurrentRecommendation();
    if (current) {
      this.recommendationsService.removeRecommendation(current.id);

      this.recommendations = this.recommendations.filter(r => r.id !== current.id);

      if (this.currentRecommendationIndex >= this.recommendations.length && this.recommendations.length > 0) {
        this.currentRecommendationIndex = this.recommendations.length - 1;
      }

      if (this.recommendations.length === 0) {
        this.closeModal();
      }
    }
  }
}
