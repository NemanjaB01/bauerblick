import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor( private router: Router) { }

  addNewFarm() {
    this.router.navigate(["new-farm"])
  }

  gotoSeeds() {
    this.router.navigate(["seeds"])
  }

  gotoHome() {
    this.router.navigate(["home"])
  }
}
