import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

export interface AlertData {
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

interface AlertTypeInfo {
  icon: string;
  color: string;
  label: string;
}

@Component({
  selector: 'app-alerts-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-notification.html',
  styleUrl: './alerts-notification.css',
})
export class AlertsNotification implements OnInit, OnDestroy {
  alerts: AlertData[] = [];
  isDropdownOpen = false;

  // For WebSocket integration
  // private alertsSubscription?: Subscription;
  // private listSubscription?: Subscription;

  ngOnInit() {
    // Load mock data for testing
    this.loadMockData();

    // TODO: For WebSocket, uncomment:
    // constructor(private alertsService: AlertsWebSocketService) {}
    //
    // this.listSubscription = this.alertsService.getAllAlerts().subscribe({
    //   next: (alerts) => {
    //     this.alerts = alerts;
    //   }
    // });
  }

  ngOnDestroy() {
    // TODO: Cleanup WebSocket subscriptions
    // if (this.alertsSubscription) {
    //   this.alertsSubscription.unsubscribe();
    // }
    // if (this.listSubscription) {
    //   this.listSubscription.unsubscribe();
    // }
  }

  /**
   * Load mock alerts for testing
   */
  private loadMockData(): void {
    const mockAlerts: AlertData[] = [
      {
        id: "alert-1",
        userId: "user-1",
        farmId: "farm-1-a",
        recommendedSeed: "WHEAT",
        recommendationType: "FROST_ALERT",
        advice: "PROTECT_CROPS_FROM_FROST",
        reasoning: "Temperature dropping below 0°C tonight. Immediate action required.",
        weatherTimestamp: "2025-12-04T20:00:00",
        metrics: {
          temperature: -2.5
        },
        receivedAt: new Date(Date.now() - 2 * 60000)
      },
      {
        id: "alert-2",
        userId: "user-1",
        farmId: "farm-2-b",
        recommendedSeed: "CORN",
        recommendationType: "WEATHER_WARNING",
        advice: "HEAVY_RAIN_EXPECTED",
        reasoning: "Heavy rainfall forecasted. Check drainage systems.",
        weatherTimestamp: "2025-12-04T18:30:00",
        metrics: {
          temperature: 8.2
        },
        receivedAt: new Date(Date.now() - 30 * 60000)
      }
    ];

    this.alerts = mockAlerts;
  }

  getAlertsCount(): number {
    return this.alerts.length;
  }

  hasAlerts(): boolean {
    return this.alerts.length > 0;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.alerts-notification-wrapper')) {
      this.closeDropdown();
    }
  }

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

  getAlertTypeInfo(type: string): AlertTypeInfo {
    const typeMap: { [key: string]: AlertTypeInfo } = {
      'FROST_ALERT': {
        icon: '❄️',
        color: '#3B82F6',
        label: 'Frost Alert'
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
      'PEST_WARNING': {
        icon: '🐛',
        color: '#EF4444',
        label: 'Pest Warning'
      },
      'SAFETY_ALERT': {
        icon: '⚠️',
        color: '#EF4444',
        label: 'Safety Alert'
      }
    };

    return typeMap[type] || {
      icon: '🚨',
      color: '#EF4444',
      label: 'Alert'
    };
  }

  formatSeedName(seedName: string | undefined): string {
    if (!seedName) return '';
    let formatted = seedName.replace(/_/g, ' ');
    formatted = formatted.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return formatted;
  }

  formatAdviceTitle(advice: string): string {
    if (!advice) return '';
    let formatted = advice.replace(/_/g, ' ');
    formatted = formatted.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return formatted;
  }

  getTimeSince(alert: AlertData): string {
    if (!alert.receivedAt) return 'Just now';
    const now = new Date();
    const received = new Date(alert.receivedAt);
    const diffMs = now.getTime() - received.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  formatTemperature(temp?: number): string {
    if (temp === undefined) return 'N/A';
    return `${temp.toFixed(1)}°C`;
  }

  dismissAlert(alertId: string): void {
    this.alerts = this.alerts.filter(a => a.id !== alertId);

    // TODO: When using WebSocket:
    // this.alertsService.removeAlert(alertId);
  }

  clearAllAlerts(): void {
    this.alerts = [];
    this.closeDropdown();

    // TODO: When using WebSocket:
    // this.alertsService.clearAlerts();
  }
}
