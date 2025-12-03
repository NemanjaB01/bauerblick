import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

interface WeatherData {
  user_id: string;
  time: string;
  farm_id: string;
  lat: number;
  lon: number;
  weather_code: number;
  temp: number;
}

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

  private wsSubscription?: Subscription;
  private dateInterval?: any;

  ngOnInit() {
    this.dateInterval = setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    // TODO: Subscribe to your WebSocket service
    // Example:
    // this.wsSubscription = this.websocketService.weatherData$.subscribe(
    //   (data: WeatherData) => {
    //     this.handleWeatherData(data);
    //   }
    // );

    // FOR TESTING:
    this.simulateWeatherData();
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.dateInterval) {
      clearInterval(this.dateInterval);
    }
  }

  handleWeatherData(data: WeatherData) {
    this.weatherData = data;
    this.lastUpdated = new Date();
    this.weatherInfo = this.getWeatherInfo(data.weather_code);
    this.reverseGeocode(data.lat, data.lon);
  }

  getWeatherInfo(code: number): WeatherInfo {
    const weatherMap: { [key: number]: WeatherInfo } = {
      0: { description: 'Clear Sky', icon: '☀️', background: 'linear-gradient(135deg, #FFE259 0%, #FFA751 100%)' },
      1: { description: 'Mainly Clear', icon: '🌤️', background: 'linear-gradient(135deg, #FFE259 0%, #FFA751 100%)' },
      2: { description: 'Partly Cloudy', icon: '⛅', background: 'linear-gradient(135deg, #89CFF0 0%, #4A90E2 100%)' },
      3: { description: 'Overcast', icon: '☁️', background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' },
      45: { description: 'Foggy', icon: '🌁', background: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)' },
      48: { description: 'Depositing Rime Fog', icon: '🌁', background: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)' },
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

    return weatherMap[code] || {
      description: 'Unknown',
      icon: '❓',
      background: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)'
    };
  }

  async reverseGeocode(lat: number, lon: number) {
    try {
      // Using Nominatim for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();

      // city/town/village name
      const address = data.address;
      this.locationName = address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        'Unknown Location';

      // Add country if available
      if (address.country) {
        this.locationName += `, ${address.country}`;
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      this.locationName = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    }
  }

  getFormattedDate(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[this.currentDate.getDay()]}, ${this.currentDate.getDate()} ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  getFormattedTime(): string {
    return this.currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
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

    // Simple "feels like" calculation
    const temp = this.weatherData.temp;
    const adjustment = this.weatherData.weather_code >= 61 ? -2 : 0; // Rain makes it feel colder

    return Math.round(temp + adjustment);
  }

  // FOR TESTING:
  private simulateWeatherData() {
    const testData: WeatherData = {
      user_id: "user-1",
      time: "2025-12-02 15:15:00+00:00",
      farm_id: "farm-1-a",
      lat: 44.14361,
      lon: 17.4,
      weather_code: 0,
      temp: 3
    };

    this.handleWeatherData(testData);
  }
}
