import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FeedbackStats {
  [key: string]: number;
}

export interface DashboardAnalytics {
  alertDistribution: {
    [alertType: string]: number;
  };
  cropVulnerability: {
    [cropType: string]: number;
  };
  waterSavings: {
    actionsTaken: number;
    actionsSaved: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private farmAnalyticsBaseUrl = 'http://localhost:8082/api/farm-analytics';
  private notificationAnalyticsBaseUrl = 'http://localhost:8085/api/analytics';

  constructor(private httpClient: HttpClient) {}

  getFeedbackStats(farmId: string): Observable<FeedbackStats> {
    return this.httpClient.get<FeedbackStats>(
      `${this.farmAnalyticsBaseUrl}/feedback-stats/${farmId}`
    );
  }

  getDashboardAnalytics(farmId: string): Observable<DashboardAnalytics> {
    return this.httpClient.get<DashboardAnalytics>(
      `${this.notificationAnalyticsBaseUrl}/dashboard/${farmId}`
    );
  }
}
