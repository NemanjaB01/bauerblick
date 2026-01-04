import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AlertsWebSocketService, AlertData, ConnectionStatus } from '../../services/websocket-service/ alert-websocket.service';
import { UserService } from '../../services/user-service/user-service';
import { FarmService } from '../../services/farm-service/farm-service';

import { Farm } from '../../models/Farm';

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
  connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;

  private userId: string | null = null;
  private currentFarm: Farm | null = null;

  private alertsSubscription?: Subscription;
  private listSubscription?: Subscription;
  private statusSubscription?: Subscription;
  private mainSubscription?: Subscription;

  constructor(
    private alertsService: AlertsWebSocketService,
    private userService: UserService,
    private farmService: FarmService
  ) {}

  ngOnInit() {
    this.setupWebSocketSubscriptions();
    this.initializeDataStream();
  }

  private initializeDataStream() {
    this.userService.getProfile().pipe(
      take(1)
    ).subscribe({
      next: (userProfile) => {
        if (userProfile && userProfile.email) {
          this.userId = userProfile.email;
          console.log('AlertsNotification: User identified via email:', this.userId);

          this.subscribeToFarmChanges();
        } else {
          console.error('AlertsNotification: Could not load User Email');
        }
      },
      error: (err) => {
        console.error('AlertsNotification: Failed to fetch profile', err);
      }
    });
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
    this.disconnectWebSocket();
  }

  private subscribeToFarmChanges() {
    this.mainSubscription = this.farmService.selectedFarm$.subscribe(farm => {
      if (farm && farm.id) {
        console.log('AlertsNotification: Farm changed to', farm.name);

        if (this.currentFarm && this.currentFarm.id !== farm.id) {
          this.alertsService.disconnect();
          this.alertsService.clearAlerts();
        }

        this.currentFarm = farm;
        this.connectWebSocket();
      } else {
        console.log('AlertsNotification: No farm selected');
        this.alertsService.disconnect();
        this.alerts = [];
      }
    });
  }

  private setupWebSocketSubscriptions(): void {
    this.alertsSubscription = this.alertsService.getAlertUpdates().subscribe({
      next: (alert: AlertData) => {
        if (this.currentFarm && alert.farmId === this.currentFarm.id) {
          console.log('New alert received for current farm:', alert);
        }
      },
      error: (error) => console.error('Error in alert updates:', error)
    });

    this.listSubscription = this.alertsService.getAllAlerts().subscribe({
      next: (alerts: AlertData[]) => {
        if (this.currentFarm) {
          this.alerts = alerts.filter(a => a.farmId === this.currentFarm?.id);
        } else {
          this.alerts = [];
        }
      },
      error: (error) => console.error('Error in alerts list:', error)
    });

    this.statusSubscription = this.alertsService.getConnectionStatus().subscribe({
      next: (status: ConnectionStatus) => {
        this.connectionStatus = status;

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

    console.log(`Connecting alerts for user ${this.userId}, farm ${this.currentFarm.id}`);
    this.alertsService.setFarmForUser(this.userId, this.currentFarm.id);
  }

  private reconnectWebSocket(): void {
    console.log('Reconnecting alerts WebSocket...');
    this.alertsService.reconnect();
  }

  private disconnectWebSocket(): void {
    console.log('Disconnecting alerts WebSocket...');
    this.alertsService.disconnect();
  }

  private cleanupSubscriptions(): void {
    if (this.alertsSubscription) this.alertsSubscription.unsubscribe();
    if (this.listSubscription) this.listSubscription.unsubscribe();
    if (this.statusSubscription) this.statusSubscription.unsubscribe();
    if (this.mainSubscription) this.mainSubscription.unsubscribe();
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
      },
      'CONTINUE_NORMAL': {
        icon: '✅',
        color: '#10B981',
        label: 'Continue Normal'
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
    this.alertsService.removeAlert(alertId);
  }

  clearAllAlerts(): void {
    this.alertsService.clearAlerts();
    this.closeDropdown();
  }
}
