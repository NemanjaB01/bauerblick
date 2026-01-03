import { Component, HostListener, OnInit } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { FieldGrid } from '../field-grid/field-grid';
import { WeatherWidget } from '../weather-widget/weather-widget';
import { Recommendations } from '../recommendations/recommendations';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service/auth.service';
import { FarmService } from '../../services/farm-service/farm-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertsNotification } from '../alerts-notification/alerts-notification';
import { Farm } from '../../models/Farm';

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
export class HomeComponent implements OnInit {
  selectedFarm: Farm | null = null;
  isMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private farmService: FarmService
  ) {}

  ngOnInit(): void {
    // Load farms on init
    this.farmService.loadFarms().subscribe(
      (farms) => {
        console.log("Farms loaded:", farms);
      },
      (error) => {
        console.error("Error loading farms:", error);
      }
    );

    // Subscribe to selected farm observable
    this.farmService.selectedFarm$.subscribe((farm) => {
      this.selectedFarm = farm;  // Update selected farm whenever it changes
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToProfile() {
    this.isMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  logFarms(): void {
    console.log('Farms in memory:', this.farmService.getFarmsInMemory());
  }

  logout() {
    this.authService.logoutUser();
    this.isMenuOpen = false;
    this.toastr.success("Signed out!")
    this.router.navigate(['/login']);
  }

  loadFarms(): void {
    console.log("Loading farms...");
    this.farmService.loadFarms().subscribe(
      (farms) => {
        console.log("Farms loaded:", farms);
      },
      (error) => {
        console.error("Error loading farms:", error);
      }
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-wrapper')) {
      this.isMenuOpen = false;
    }
  }
}
