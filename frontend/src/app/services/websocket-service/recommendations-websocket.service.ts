import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

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

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationsWebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private recommendationsSubject = new Subject<RecommendationData>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  private allRecommendations: RecommendationData[] = [];
  private recommendationsListSubject = new BehaviorSubject<RecommendationData[]>([]);

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 5000;
  private reconnectTimer?: any;

  // WebSocket URL - CHANGE THIS!!!!
  private wsUrl = 'ws://localhost:8080/recommendations';

  private heartbeatInterval?: any;
  private heartbeatTimeout = 30000;

  constructor() {
    this.connect();
  }

  getRecommendationUpdates(): Observable<RecommendationData> {
    return this.recommendationsSubject.asObservable();
  }

  getAllRecommendations(): Observable<RecommendationData[]> {
    return this.recommendationsListSubject.asObservable();
  }

  getCurrentRecommendations(): RecommendationData[] {
    return this.allRecommendations;
  }

  getRecommendationsCount(): number {
    return this.allRecommendations.length;
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  clearRecommendations(): void {
    this.allRecommendations = [];
    this.recommendationsListSubject.next([]);
  }

  removeRecommendation(id: string): void {
    this.allRecommendations = this.allRecommendations.filter(r => r.id !== id);
    this.recommendationsListSubject.next([...this.allRecommendations]);
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      console.log('Recommendations WebSocket already connected');
      return;
    }

    try {
      console.log(`Connecting to ${this.wsUrl}...`);
      this.connectionStatusSubject.next(ConnectionStatus.CONNECTING);

      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('Recommendations WebSocket connected');
        this.connectionStatusSubject.next(ConnectionStatus.CONNECTED);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          let jsonData: string = event.data;

          if (jsonData.includes('ALERT [')) {
            const jsonStart = jsonData.indexOf('{');
            if (jsonStart !== -1) {
              jsonData = jsonData.substring(jsonStart);
            }
          }

          const data: RecommendationData = JSON.parse(jsonData);
          data.receivedAt = new Date();

          console.log(' Recommendation received:', data);

          this.allRecommendations.push(data);
          this.recommendationsListSubject.next([...this.allRecommendations]);
          this.recommendationsSubject.next(data);

        } catch (error) {
          console.error(' Error parsing recommendation:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error(' WebSocket error:', error);
        this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      };

      this.socket.onclose = (event) => {
        console.log(' WebSocket closed:', event.code);
        this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
        this.socket = null;
        this.stopHeartbeat();
        this.attemptReconnect();
      };

    } catch (error) {
      console.error(' Failed to create WebSocket:', error);
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(` Max reconnection attempts reached`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.min(this.reconnectAttempts, 3);

    console.log(` Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

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
    this.recommendationsSubject.complete();
    this.recommendationsListSubject.complete();
    this.connectionStatusSubject.complete();
  }
}
