import {Injectable} from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class Globals {
  readonly backendUri: string = Globals.findBackendUrl();
  readonly wsUri: string = Globals.findWebSocketUrl();

  private static findBackendUrl(): string {
    if (window.location.port === '4200') { // local `ng serve`, backend at localhost:8080
      return 'http://localhost:8080/api';
    } else {
      // assume deployed somewhere and backend is available at same host/port as frontend
      return window.location.protocol + '//' + window.location.host + window.location.pathname + 'api';
    }
  }

  private static findWebSocketUrl(): string {
    if (window.location.port === '4200') { // local `ng serve`, backend at localhost:8085
      return 'http://localhost:8085';
    } else {
      // assume deployed somewhere and backend is available at same host/port as frontend
      return window.location.protocol + '//' + window.location.host + window.location.pathname.replace(/\/$/, '');
    }
  }
}


