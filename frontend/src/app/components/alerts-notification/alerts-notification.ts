import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertsWebSocketService, AlertData, ConnectionStatus } from '../../services/websocket-service/ alert-websocket.service';

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

  private userId: string = 'user-1';
  private farmId: string = 'farm-1-b';

  private alertsSubscription?: Subscription;
  private listSubscription?: Subscription;
  private statusSubscription?: Subscription;

  constructor(private alertsService: AlertsWebSocketService) {}

  ngOnInit() {
    this.setupWebSocketSubscriptions();
    this.connectWebSocket();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
    this.disconnectWebSocket();
  }

  private setupWebSocketSubscriptions(): void {
    this.alertsSubscription = this.alertsService.getAlertUpdates().subscribe({
      next: (alert: AlertData) => {
        console.log('New alert received:', alert);
      },
      error: (error) => {
        console.error('Error in alert updates:', error);
      }
    });

    this.listSubscription = this.alertsService.getAllAlerts().subscribe({
      next: (alerts: AlertData[]) => {
        console.log('Alerts list updated:', alerts.length);
        this.alerts = alerts;
      },
      error: (error) => {
        console.error('Error in alerts list:', error);
      }
    });

    this.statusSubscription = this.alertsService.getConnectionStatus().subscribe({
      next: (status: ConnectionStatus) => {
        this.connectionStatus = status;
        console.log('Alerts connection status:', status);

        if (status === ConnectionStatus.DISCONNECTED) {
          setTimeout(() => {
            if (this.connectionStatus === ConnectionStatus.DISCONNECTED) {
              this.reconnectWebSocket();
            }
          }, 5000);
        }
      },
      error: (error) => {
        console.error('Error in connection status:', error);
      }
    });
  }

  private connectWebSocket(): void {
    console.log(`Connecting alerts for user ${this.userId}, farm ${this.farmId}`);
    this.alertsService.setFarmForUser(this.userId, this.farmId);
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

  isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED;
  }
}
