import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WeatherWebSocketService, WeatherData, ConnectionStatus } from '../../services/websocket-service/weather-websocket.service';

interface WeatherInfo {
  description: string;
  icon: string;
  background: string;
}

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-widget.html',
  styleUrl: './weather-widget.css',
})
export class WeatherWidget implements OnInit, OnDestroy {
  weatherData: WeatherData | null = null;
  locationName: string = 'Loading location...';
  currentDate: Date = new Date();
  lastUpdated: Date | null = null;
  weatherInfo: WeatherInfo | null = null;

  connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private wsSubscription?: Subscription;
  private statusSubscription?: Subscription;
  private dateInterval?: any;
  private userId: string = 'user-2';
  private currentFarmId: string = 'farm-2-a';

  private getCacheKey(): string {
    return `weather_cache_${this.userId}_${this.currentFarmId}`;
  }

  private readonly MAX_CACHE_AGE = 10 * 60 * 1000;

  constructor(private weatherService: WeatherWebSocketService) {}

  ngOnInit() {
    this.loadCachedDataForCurrentFarm();

    this.dateInterval = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    this.statusSubscription = this.weatherService.getConnectionStatus().subscribe({
      next: (status) => {
        this.connectionStatus = status;

        if (status === ConnectionStatus.DISCONNECTED) {
          setTimeout(() => {
            if (this.connectionStatus === ConnectionStatus.DISCONNECTED) {
              this.reconnectWebSocket();
            }
          }, 5000);
        }
      },
      error: (error) => {
        console.error('Connection status error:', error);
      }
    });

    this.wsSubscription = this.weatherService.getWeatherUpdates().subscribe({
      next: (data: WeatherData) => {
        console.log('Received weather update:', data);

        if (data.farm_id === this.currentFarmId) {
          this.handleWeatherData(data);
        } else {
          this.cacheOtherFarmData(data);
        }
      },
      error: (error) => {
        console.error('Error receiving weather updates:', error);
      },
      complete: () => {}
    });

    this.connectWebSocket();

  }

  ngOnDestroy() {
    this.disconnectWebSocket();

    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
    if (this.dateInterval) {
      clearInterval(this.dateInterval);
    }
  }

  private loadCachedDataForCurrentFarm(): void {
    try {
      const cached = localStorage.getItem(this.getCacheKey());
      if (cached) {
        const cacheData = JSON.parse(cached);
        const cacheTime = new Date(cacheData.timestamp);
        const now = new Date();
        const age = now.getTime() - cacheTime.getTime();

        if (age < this.MAX_CACHE_AGE) {

          this.weatherData = cacheData.weatherData;
          this.lastUpdated = cacheTime;
          this.weatherInfo = cacheData.weatherInfo;

          if (cacheData.locationName) {
            this.locationName = cacheData.locationName;
          } else if (this.weatherData) {
            this.reverseGeocode(this.weatherData.lat, this.weatherData.lon);
          }

          console.log(`Loaded cached weather data for farm: ${this.currentFarmId}`);
        } else {
          localStorage.removeItem(this.getCacheKey());
        }
      }
    } catch (error) {
      console.error(`Error loading cache for farm ${this.currentFarmId}:`, error);
      localStorage.removeItem(this.getCacheKey());
    }
  }


  private saveToCache(data: WeatherData, locationName?: string, weatherInfo?: WeatherInfo): void {
    try {
      const cacheData = {
        weatherData: data,
        weatherInfo: weatherInfo,
        locationName: locationName,
        timestamp: new Date().toISOString(),
        farmId: this.currentFarmId
      };

      localStorage.setItem(this.getCacheKey(), JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Error saving cache for farm ${this.currentFarmId}:`, error);
    }
  }



  /**
   * Connect to WebSocket with current user ID
   */
  private connectWebSocket(): void {
    console.log('Connecting WebSocket for user:', this.userId);

    try {
      this.weatherService.setUserId(this.userId);
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  }


  private disconnectWebSocket(): void {
    console.log('Disconnecting from WebSocket');

    try {
      this.weatherService.disconnect();
      console.log('WebSocket disconnected');
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error);
    }
  }

  /**
   * Manually reconnect WebSocket
   */
  reconnectWebSocket(): void {
    console.log('Manual reconnect initiated');

    try {
      this.weatherService.reconnect();
      setTimeout(() => {
        this.connectWebSocket();
      }, 1000);
    } catch (error) {
      console.error('Error reconnecting WebSocket:', error);
    }
  }

  private cacheOtherFarmData(data: WeatherData): void {
    try {
      const otherFarmCacheKey = `weather_cache_${data.user_id}_${data.farm_id}`;
      const cacheData = {
        weatherData: data,
        timestamp: new Date().toISOString(),
        farmId: data.farm_id
      };

      localStorage.setItem(otherFarmCacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Error caching data for farm ${data.farm_id}:`, error);
    }
  }

  handleWeatherData(data: WeatherData) {
    if (data.farm_id !== this.currentFarmId) {
      return;
    }

    console.log('Handling weather data for current farm:', data);

    this.weatherData = data;
    this.lastUpdated = new Date();
    this.weatherInfo = this.getWeatherInfo(data.weather_code);

    this.saveToCache(data, this.locationName, this.weatherInfo || undefined);

    this.reverseGeocode(data.lat, data.lon);
  }

  async reverseGeocode(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();

      const address = data.address;
      this.locationName = address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        'Unknown Location';

      if (address.country) {
        this.locationName += `, ${address.country}`;
      }

      if (this.weatherData) {
        this.saveToCache(this.weatherData, this.locationName, this.weatherInfo || undefined);
      }

    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      this.locationName = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    }
  }

  getWeatherInfo(code: number): WeatherInfo {
    const weatherMap: { [key: number]: WeatherInfo } = {
      0: { description: 'Clear Sky', icon: '☀️', background: 'linear-gradient(135deg, #FFE259 0%, #FFA751 100%)' },
      1: { description: 'Mainly Clear', icon: '🌤️', background: 'linear-gradient(135deg, #FFE259 0%, #FFA751 100%)' },
      2: { description: 'Partly Cloudy', icon: '⛅', background: 'linear-gradient(135deg, #89CFF0 0%, #4A90E2 100%)' },
      3: { description: 'Overcast', icon: '☁️', background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' },
      45: { description: 'Foggy', icon: '🌫️', background: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)' },
      48: { description: 'Depositing Rime Fog', icon: '🌫️', background: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)' },
      51: { description: 'Light Drizzle', icon: '🌦️', background: 'linear-gradient(135deg, #7EC8E3 0%, #4A90E2 100%)' },
      53: { description: 'Moderate Drizzle', icon: '🌧️', background: 'linear-gradient(135deg, #5DADE2 0%, #3498DB 100%)' },
      55: { description: 'Dense Drizzle', icon: '🌧️', background: 'linear-gradient(135deg, #5DADE2 0%, #2980B9 100%)' },
      56: { description: 'Light Freezing Drizzle', icon: '🌨️', background: 'linear-gradient(135deg, #AED6F1 0%, #85C1E2 100%)' },
      57: { description: 'Dense Freezing Drizzle', icon: '🌨️', background: 'linear-gradient(135deg, #AED6F1 0%, #5DADE2 100%)' },
      61: { description: 'Slight Rain', icon: '🌧️', background: 'linear-gradient(135deg, #5DADE2 0%, #3498DB 100%)' },
      63: { description: 'Moderate Rain', icon: '🌧️', background: 'linear-gradient(135deg, #3498DB 0%, #2874A6 100%)' },
      65: { description: 'Heavy Rain', icon: '⛈️', background: 'linear-gradient(135deg, #2874A6 0%, #1B4F72 100%)' },
      66: { description: 'Light Freezing Rain', icon: '🌨️', background: 'linear-gradient(135deg, #AED6F1 0%, #85C1E2 100%)' },
      67: { description: 'Heavy Freezing Rain', icon: '🌨️', background: 'linear-gradient(135deg, #85C1E2 0%, #5DADE2 100%)' },
      71: { description: 'Slight Snow', icon: '🌨️', background: 'linear-gradient(135deg, #E8F4F8 0%, #B8D4E0 100%)' },
      73: { description: 'Moderate Snow', icon: '❄️', background: 'linear-gradient(135deg, #D6EAF8 0%, #AED6F1 100%)' },
      75: { description: 'Heavy Snow', icon: '❄️', background: 'linear-gradient(135deg, #AED6F1 0%, #85C1E2 100%)' },
      77: { description: 'Snow Grains', icon: '🌨️', background: 'linear-gradient(135deg, #E8F4F8 0%, #D6EAF8 100%)' },
      80: { description: 'Slight Rain Showers', icon: '🌦️', background: 'linear-gradient(135deg, #7EC8E3 0%, #4A90E2 100%)' },
      81: { description: 'Moderate Rain Showers', icon: '🌧️', background: 'linear-gradient(135deg, #4A90E2 0%, #3498DB 100%)' },
      82: { description: 'Violent Rain Showers', icon: '⛈️', background: 'linear-gradient(135deg, #2874A6 0%, #1B4F72 100%)' },
      85: { description: 'Slight Snow Showers', icon: '🌨️', background: 'linear-gradient(135deg, #E8F4F8 0%, #D6EAF8 100%)' },
      86: { description: 'Heavy Snow Showers', icon: '❄️', background: 'linear-gradient(135deg, #AED6F1 0%, #85C1E2 100%)' },
      95: { description: 'Thunderstorm', icon: '⛈️', background: 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)' },
      96: { description: 'Thunderstorm with Hail', icon: '⛈️', background: 'linear-gradient(135deg, #2C3E50 0%, #1C2833 100%)' },
      99: { description: 'Thunderstorm with Heavy Hail', icon: '⛈️', background: 'linear-gradient(135deg, #1C2833 0%, #17202A 100%)' }
    };

    const result = weatherMap[code] || {
      description: 'Unknown',
      icon: '❓',
      background: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)'
    };

    return result;
  }



  getFormattedDate(): string {
    try {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const day = days[this.currentDate.getDay()];
      const date = this.currentDate.getDate();
      const month = months[this.currentDate.getMonth()];
      const year = this.currentDate.getFullYear();

      return `${day}, ${date} ${month} ${year}`;
    } catch (error) {
      console.error('Error in getFormattedDate:', error);
      return 'Monday, 1 Jan 2025';
    }
  }

  getTimeSinceUpdate(): string {
    if (!this.lastUpdated) return '';

    const now = new Date();
    const diffMs = now.getTime() - this.lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  getFeelsLikeTemp(): number {
    if (!this.weatherData) return 0;

    const temp = this.weatherData.temp;
    const adjustment = this.weatherData.weather_code >= 61 ? -2 : 0;

    return Math.round(temp + adjustment);
  }

  isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED;
  }
}
