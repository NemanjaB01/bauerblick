import { Component, HostListener} from '@angular/core';

import { Sidebar } from '../sidebar/sidebar';
import { FieldGrid } from '../field-grid/field-grid';
import { WeatherWidget } from '../weather-widget/weather-widget';
import { Recommendations } from '../recommendations/recommendations';
import {CommonModule} from '@angular/common';

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
    CommonModule
  ]
})
export class HomeComponent {

  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToProfile() {
    this.isMenuOpen = false;
    // Navigate to profile
  }

  logout() {
    this.isMenuOpen = false;
    // Handle logout
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-wrapper')) {
      this.isMenuOpen = false;
    }
  }
}
