import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

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

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

@Injectable({
  providedIn: 'root'
})
export class AlertsWebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private alertsSubject = new Subject<AlertData>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  private allAlerts: AlertData[] = [];
  private alertsListSubject = new BehaviorSubject<AlertData[]>([]);

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 5000;
  private reconnectTimer?: any;

  // WebSocket URL
  private wsUrl = 'ws://localhost:8080/alerts';

  private heartbeatInterval?: any;
  private heartbeatTimeout = 30000;

  constructor() {
    this.connect();
  }

  getAlertUpdates(): Observable<AlertData> {
    return this.alertsSubject.asObservable();
  }

  getAllAlerts(): Observable<AlertData[]> {
    return this.alertsListSubject.asObservable();
  }

  getCurrentAlerts(): AlertData[] {
    return this.allAlerts;
  }

  getAlertsCount(): number {
    return this.allAlerts.length;
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  clearAlerts(): void {
    this.allAlerts = [];
    this.alertsListSubject.next([]);
  }

  removeAlert(id: string): void {
    this.allAlerts = this.allAlerts.filter(a => a.id !== id);
    this.alertsListSubject.next([...this.allAlerts]);
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      console.log('Alerts WebSocket already connected');
      return;
    }

    try {
      console.log(`Connecting to Alerts WebSocket at ${this.wsUrl}...`);
      this.connectionStatusSubject.next(ConnectionStatus.CONNECTING);

      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log(' Alerts WebSocket connected');
        this.connectionStatusSubject.next(ConnectionStatus.CONNECTED);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          let jsonData: string = event.data;

          // Handle "ALERT [farm-id]: {json}" format
          if (jsonData.includes('ALERT [')) {
            const jsonStart = jsonData.indexOf('{');
            if (jsonStart !== -1) {
              jsonData = jsonData.substring(jsonStart);
            }
          }

          const data: AlertData = JSON.parse(jsonData);
          data.receivedAt = new Date();

          console.log('Alert received:', data);

          this.allAlerts.push(data);
          this.alertsListSubject.next([...this.allAlerts]);
          this.alertsSubject.next(data);

        } catch (error) {
          console.error(' Error parsing alert:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Alerts WebSocket error:', error);
        this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      };

      this.socket.onclose = (event) => {
        console.log(' Alerts WebSocket closed:', event.code);
        this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
        this.socket = null;
        this.stopHeartbeat();
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Failed to create Alerts WebSocket:', error);
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(` Max reconnection attempts reached for Alerts`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.min(this.reconnectAttempts, 3);

    console.log(` Reconnecting Alerts (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close(1000);
      this.socket = null;
    }
    this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
  }

  reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 100);
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatTimeout);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.alertsSubject.complete();
    this.alertsListSubject.complete();
    this.connectionStatusSubject.complete();
  }
}
