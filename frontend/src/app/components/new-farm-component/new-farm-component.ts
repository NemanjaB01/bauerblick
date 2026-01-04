import { Component, HostListener } from '@angular/core';
import {CommonModule} from '@angular/common';
import { NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Map } from '../map/map';
import { SoilType } from '../../models/SoilType';
import { FarmCreateDto } from '../../dtos/farm';
import { FarmService } from '../../services/farm-service/farm-service';
import { UserService } from '../../services/user-service/user-service';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-farm-component',
  standalone : true,
  imports: [
    CommonModule,
    FormsModule,
    Map
  ],
  templateUrl: './new-farm-component.html',
  styleUrl: './new-farm-component.css',
})
export class NewFarmComponent {
  constructor( private router: Router, private farmService : FarmService, private userService: UserService) { }
  //TODO: Possibly add private auth: AuthService in order to extract email
  farm : FarmCreateDto = new FarmCreateDto();
  farmName = '';
  errorMessage = '';
  selectedCoords: { lat: number; lng: number } | null = null;
  results: any[] = [];
    soilTypes = Object.entries(SoilType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({ id: value as number, name: key }));

  selectedSoil: SoilType | null = null;
  soilType : SoilType = SoilType.Chalk;

  onSearch(event: any) {
    const query = event.target.value;

    if (!query.trim()) {
      this.results = [];
      return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=at&q=${query}`)
      .then(res => res.json())
      .then(data => {
        this.results = data.map((item: any) => ({
          raw: item, // original data
          short: this.formatAddress(item), // shortened version
        }));
      });
  }
  formatAddress(item: any): string {
    const a = item.address;

    const street = a.road || a.pedestrian || a.cycleway || a.footway || "";
    const number = a.house_number || "";
    const city = a.city || a.town || a.village || a.municipality || "";
    const postcode = a.postcode || "";

    return `${postcode} ${street} ${number}, ${city}`.trim().replace(/^,|,$/g, "");
  }


  selectAddress(r: any) {
    this.results = [];

    const lat = Number(r.lat);
    const lng = Number(r.lon);

    this.selectedCoords = { lat, lng };
    this.farm.latitude = this.selectedCoords.lat
    this.farm.longitude = this.selectedCoords.lng
  }

  onSubmit() {

  }

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
  onLocationSelected(coords: { lat: number; lng: number }) {
      this.farm.latitude = coords.lat;
      this.farm.longitude = coords.lng;
    }

  addNewFarm() {
    if (this.selectedSoil) {
      this.farm.soilType = this.selectedSoil;
    }
    //this.farm.email = this.auth.email;
//     this.farm.email = "testuser@example.com";
    console.log(this.farm);
    console.log(this.selectedSoil);
    if (this.farm) {
      if (this.farm.name == "" ||  this.farm.latitude == 0 || this.farm.longitude == 0) {
        this.errorMessage = "Not all fields are filled"
        console.log(this.errorMessage);
      }
      else {
        console.log(this.farm);

        this.farmService.addNewFarm(this.farm).subscribe();
      }
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
