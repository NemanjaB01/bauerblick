import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client } from '@stomp/stompjs';

declare var SockJS: any;

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
export class WeatherWebSocketService {
  private serverUrl = 'http://localhost:8081/ws-alerts';
  private isConnecting = false;
  private stompClient: Client | null = null;
  private weatherSubject = new Subject<WeatherData>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  constructor() {}

  setUserId(userId: string): void {
    console.log(`User ID set: ${userId} - Connecting to WebSocket`);
    this.connectionStatusSubject.next(ConnectionStatus.CONNECTING);
    this.connectToWebSocket(userId);
  }

  private connectToWebSocket(userId: string): void {
    if (this.isConnecting || this.stompClient?.connected) {
      console.log('Already connecting or connected');
      return;
    }

    try {
      this.isConnecting = true;

      if (typeof SockJS === 'undefined') {
        throw new Error('SockJS is not loaded');
      }

      const socket = new SockJS(this.serverUrl);

      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('Connected to WebSocket server via SockJS');
          this.isConnecting = false;
          this.connectionStatusSubject.next(ConnectionStatus.CONNECTED);
          this.subscribeToWeather(userId);
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          this.isConnecting = false;
          this.connectionStatusSubject.next(ConnectionStatus.ERROR);
        },
        onWebSocketError: (event) => {
          console.error('WebSocket Error:', event);
          this.isConnecting = false;
          this.connectionStatusSubject.next(ConnectionStatus.ERROR);
        },
        onDisconnect: () => {
          console.log('Disconnected from WebSocket');
          this.isConnecting = false;
          this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
        }
      });

      this.stompClient.activate();

    } catch (error) {
      console.error('Failed to connect:', error);
      this.isConnecting = false;
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
    }
  }

  /**
   * Subscribe to weather topic
   */
  private subscribeToWeather(userId: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Cannot subscribe: not connected');
      return;
    }

    const topic = `/topic/weather/${userId}`;
    console.log(`Subscribing to: ${topic}`);

    this.stompClient.subscribe(topic, (message) => {
      try {
        const weatherData: WeatherData = JSON.parse(message.body);
        console.log('Received REAL weather data:', weatherData);
        this.weatherSubject.next(weatherData);
      } catch (error) {
        console.error('Error parsing weather data:', error);
      }
    });
  }

  /**
   * Get weather updates observable
   */
  getWeatherUpdates(): Observable<WeatherData> {
    return this.weatherSubject.asObservable();
  }

  /**
   * Get connection status observable
   */
  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Reconnect manually
   */
  reconnect(): void {
    console.log('Manual reconnect');

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }

    this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Disconnect
   */
  public disconnect(): void {
    console.log('Disconnecting WebSocket service');

    if (this.stompClient) {
      try {
        this.stompClient.deactivate();
        console.log('WebSocket deactivated');
      } catch (error) {
        console.error('Error deactivating STOMP client:', error);
      }
      this.stompClient = null;
    }

    this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
    this.isConnecting = false;
  }
}
