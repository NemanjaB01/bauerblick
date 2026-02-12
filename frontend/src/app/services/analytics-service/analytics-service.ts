import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Globals } from '../../global/globals';

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
  private farmAnalyticsBaseUri: string;
  private notificationAnalyticsBaseUri: string;

  constructor(private httpClient: HttpClient, private globals: Globals) {
    this.farmAnalyticsBaseUri = this.globals.backendUri + '/farm-analytics';
    this.notificationAnalyticsBaseUri = this.globals.backendUri + '/analytics';
  }

  getFeedbackStats(farmId: string): Observable<FeedbackStats> {
    return this.httpClient.get<FeedbackStats>(
      `${this.farmAnalyticsBaseUri}/feedback-stats/${farmId}`
    );
  }

  getDashboardAnalytics(farmId: string): Observable<DashboardAnalytics> {
    return this.httpClient.get<DashboardAnalytics>(
      `${this.notificationAnalyticsBaseUri}/dashboard/${farmId}`
    );
  }
}
