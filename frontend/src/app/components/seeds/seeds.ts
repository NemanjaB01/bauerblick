import { Component, HostListener, OnInit} from '@angular/core';

import { Sidebar } from '../sidebar/sidebar';
import {CommonModule} from '@angular/common';
import { Router } from '@angular/router';
import { SeedService } from '../../services/seed-service/seed-service';
import { Seed } from '../../models/Seed';

@Component({
  selector: 'app-seeds',
  standalone: true,
  imports: [
    Sidebar,
    CommonModule
  ],
  templateUrl: './seeds.html',
  styleUrl: './seeds.css',
})
export class SeedsComponent implements OnInit {

  isMenuOpen = false;
  constructor( private router: Router, private seedService : SeedService) { }

  seeds : Seed[] = [];
  ngOnInit(): void {
      this.seedService.getAll().subscribe(
        data => {
          if (data) {
            this.seeds = data
            console.log(data)
          }
        }
      )
  }

  getSeedIcon(seedType: string): string {
  switch(seedType) {
    case 'CORN': return '/assets/icons/corn.svg';
    case 'WHEAT': return '/assets/icons/wheat.svg';
    case 'BARLEY': return '/assets/icons/barely.svg';
    case 'PUMPKIN': return '/assets/icons/pumpkin.svg';
    case 'BLACK_GRAPES': return '/assets/icons/grape.svg';
    case 'WHITE_GRAPES': return '/assets/icons/white_grape.svg';
    default: return '/assets/icons/default.svg';
  }
  }

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
