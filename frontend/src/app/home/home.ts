import { Component, HostListener} from '@angular/core';

import { Sidebar } from '../components/sidebar/sidebar';
import { FieldGrid } from '../components/field-grid/field-grid';
import { WeatherWidget } from '../components/weather-widget/weather-widget';
import { Recommendations } from '../components/recommendations/recommendations';
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
