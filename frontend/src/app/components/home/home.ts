import { Component, HostListener} from '@angular/core';

import { Sidebar } from '../sidebar/sidebar';
import { FieldGrid } from '../field-grid/field-grid';
import { WeatherWidget } from '../weather-widget/weather-widget';
import { Recommendations } from '../recommendations/recommendations';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../services/auth-service/auth.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import { AlertsNotification } from '../alerts-notification/alerts-notification';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [
    Sidebar,
    FieldGrid,
    WeatherWidget,
    Recommendations,
    CommonModule,
    AlertsNotification
  ]
})
export class HomeComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToProfile() {
    this.isMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logoutUser();
    this.isMenuOpen = false;
    this.toastr.success("Signed out!")
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-wrapper')) {
      this.isMenuOpen = false;
    }
  }
}
