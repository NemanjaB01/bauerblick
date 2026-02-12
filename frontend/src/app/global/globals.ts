import {Injectable} from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class Globals {
  readonly backendUri: string = Globals.findBackendUrl();
  readonly wsUri: string = Globals.findWebSocketUrl();
  //readonly backendImageUri: string = Globals.findImageBackendUrl();

  private static findBackendUrl(): string {
    if (window.location.port === '4200') { // local `ng serve`, backend at localhost:8080
      return 'http://localhost:8080/api';
    } else {
      return 'https://bauerblick.com/api';
    }
  }

  private static findWebSocketUrl(): string {
    if (window.location.port === '4200') {
      return 'http://localhost:8080/ws-alerts';
    } else {
      return 'wss://bauerblick.com/ws-alerts';
    }
  }

  //private static findImageBackendUrl(): string {
  //  if (window.location.port === '4200') { // local `ng serve`, backend at localhost:8080
  //    return 'http://localhost:8080/assets';
  //  } else {
  //    // assume deployed somewhere and backend is available at same host/port as frontend
  //    return window.location.protocol + '//' + window.location.host + window.location.pathname + 'assets';
  //  }
  //}
}


