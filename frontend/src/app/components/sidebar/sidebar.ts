import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {UserService} from '../../services/user-service/user-service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  displayName: string = 'Loading...';
  constructor( private router: Router, private userService: UserService) { }
  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.displayName = `${user.firstName} ${user.lastName}`;
      },
      error: (err) => {
        console.error('Failed to fetch user name', err);
        this.displayName = 'Guest';
      }
    });
  }
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
