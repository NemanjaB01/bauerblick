import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

// Components
import { TopbarComponent } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';
import { FieldGrid } from '../field-grid/field-grid';
import { WeatherWidget } from '../weather-widget/weather-widget';
import { Recommendations } from '../recommendations/recommendations';

// Services & Models
import { AuthService } from '../../services/auth-service/auth.service';
import { FarmService } from '../../services/farm-service/farm-service';
import { Farm } from '../../models/Farm';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [
    CommonModule,
    TopbarComponent,
    Sidebar,
    FieldGrid,
    WeatherWidget,
    Recommendations,
  ]
})
export class HomeComponent implements OnInit {
  selectedFarm: Farm | null = null;

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
      this.selectedFarm = farm;
    });
  }

  // Dev control methods
  logFarms(): void {
    console.log('Farms in memory:', this.farmService.getFarmsInMemory());
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
}
