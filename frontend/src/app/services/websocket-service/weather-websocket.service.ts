import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

export interface WeatherData {
  user_id: string;
  time: string;
  farm_id: string;
  lat: number;
  lon: number;
  weather_code: number;
  temp: number;
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
export class WeatherWebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private weatherSubject = new Subject<WeatherData>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 5000;
  private reconnectTimer?: any;

  // CHANGE LINK TO BACKEND URL
  private wsUrl = 'ws://localhost:8080/weather';

  private heartbeatInterval?: any;
  private heartbeatTimeout = 30000;

  constructor() {
    // Auto-connect on service initialization
    this.connect();
  }

  /**
   * Get observable stream of weather updates
   */
  getWeatherUpdates(): Observable<WeatherData> {
    return this.weatherSubject.asObservable();
  }

  /**
   * Get observable stream of connection status
   */
  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    // Don't connect if already connected or connecting
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      console.log(`Connecting to WebSocket at ${this.wsUrl}...`);
      this.connectionStatusSubject.next(ConnectionStatus.CONNECTING);

      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.connectionStatusSubject.next(ConnectionStatus.CONNECTED);
        this.reconnectAttempts = 0;

        this.startHeartbeat();

      };

      this.socket.onmessage = (event) => {
        try {
          const data: WeatherData = JSON.parse(event.data);
          console.log('📦 Weather data received:', data);
          this.weatherSubject.next(data);
        } catch (error) {
          console.error('❌ Error parsing weather data:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      };

      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
        this.socket = null;
        this.stopHeartbeat();

        this.attemptReconnect();
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      this.weatherSubject.error(new Error('WebSocket connection failed after maximum retry attempts'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.min(this.reconnectAttempts, 3); // Exponential backoff (capped at 3x)

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Send a message to the WebSocket server
   */
  send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('Message sent:', message);
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }

  /**
   * Manually disconnect from WebSocket
   */
  disconnect(): void {
    console.log('Manually disconnecting WebSocket...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }

    this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Manually reconnect (useful for refresh button)
   */
  reconnect(): void {
    console.log('Manual reconnect requested...');
    this.disconnect();
    this.reconnectAttempts = 0; // Reset attempts
    setTimeout(() => this.connect(), 100);
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection status
   */
  getCurrentStatus(): ConnectionStatus {
    return this.connectionStatusSubject.value;
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatTimeout);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Clean up on service destroy
   */
  ngOnDestroy(): void {
    this.disconnect();
    this.weatherSubject.complete();
    this.connectionStatusSubject.complete();
  }
}
