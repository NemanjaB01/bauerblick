import { Component, EventEmitter, OnInit, Output, Input, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements OnInit {
  private map: any;
  private redIcon: any;
  private currentMarker: any;

  constructor(private http: HttpClient) { }

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();
  @Input() externalCoords: { lat: number; lng: number } | null = null;

  ngOnInit(): void {
    this.initMap();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['externalCoords'] && this.externalCoords && this.map) {
      const { lat, lng } = this.externalCoords;
      this.addMarker({ lat, lng });
      this.findLocationName(lat, lng); 

      this.map.setView([lat, lng], 15);
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([47.61, 15.37], 6.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.redIcon = L.icon({
      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32] 
    });

    this.map.on('click', (e: any) => {
      const latLng = e.latlng;
      this.addMarker(latLng); 
      this.findLocationName(latLng.lat, latLng.lng); 
      this.locationSelected.emit({ lat: latLng.lat, lng: latLng.lng });

    });


  const geocoder = (L.Control as any).geocoder({
    defaultMarkGeocode: false,
    geocoder: new ((L.Control as any).Geocoder.nominatim)({
      geocodingQueryParams: {
        countrycodes: 'at',  // ISO 3166-1 alpha-2 code for Austria
        bounded: 1,          // Restrict results to viewbox
        viewbox: '9.5,46.4,17.2,49.0'  // Bounding box for Austria
      }
    })
  })
      .on('markgeocode', (result: any) => {
        const latlng = result.geocode.center;
        this.map.setView(latlng, 13);
        this.addMarker(latlng, result.geocode.name);
      })
      .addTo(this.map);

  }

  public addCurrentLocationMarker(position: { lat: number; lng: number }): void {
    const latLng = L.latLng(position.lat, position.lng); 

    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    this.currentMarker = L.marker(latLng, { icon: this.redIcon }).addTo(this.map);
    this.currentMarker.bindPopup('Your Current Location').openPopup();

    this.locationSelected.emit(position);
  }

  private addMarker(latlng: any, popupText?: string): void {
    // Remove existing marker if it exists
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    this.currentMarker = L.marker(latlng, { icon: this.redIcon }).addTo(this.map);
    if (popupText) {
      this.currentMarker.bindPopup(popupText).openPopup();
    } else {
      this.findLocationName(latlng.lat.toFixed(4), latlng.lng.toFixed(4)); 
      // this.currentMarker.bindPopup(`Marker at ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`).openPopup();
    }
  }

  private findLocationName(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    this.http.get(url).subscribe(
      (data: any) => {
        const locationName = data.display_name; // Extract the location name
        if (locationName) {
          L.popup()
            .setLatLng([lat, lng])
            .setContent(`Location: ${locationName}`)
            .openOn(this.map);
        }
      },
      (error) => {
        console.error('Error fetching location name', error);
      }
    );
  }
}