import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {AlertsNotification} from '../alerts-notification/alerts-notification';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertsNotification],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  userData = {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max.mustermann@email.com'
  };

  originalData = {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max.mustermann@email.com'
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  profilePicture: string | null = null;
  originalProfilePicture: string | null = null;

  isMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Load user data from our API/service
    this.loadUserData();
  }

  loadUserData() {
    // TODO: Replace with actual API call
    // For now, using dummy data
    this.userData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max.mustermann@email.com'
    };

    this.originalData = { ...this.userData };
    this.profilePicture = null; // or load from API if user has one
    this.originalProfilePicture = this.profilePicture;
  }

  // Toggle password visibility
  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // File upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicture = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Check if specific field has changed
  hasChanges(field: keyof typeof this.userData): boolean {
    return this.userData[field] !== this.originalData[field];
  }

  // Check if any changes exist
  hasAnyChanges(): boolean {
    const dataChanged =
      this.userData.firstName !== this.originalData.firstName ||
      this.userData.lastName !== this.originalData.lastName;

    const passwordChanged =
      this.passwordData.currentPassword !== '' ||
      this.passwordData.newPassword !== '' ||
      this.passwordData.confirmPassword !== '';

    const pictureChanged = this.profilePicture !== this.originalProfilePicture;

    return dataChanged || passwordChanged || pictureChanged;
  }

  // Validate password change
  validatePasswordChange(): boolean {
    if (this.passwordData.newPassword || this.passwordData.confirmPassword) {
      if (!this.passwordData.currentPassword) {
        alert('Please enter your current password');
        return false;
      }

      if (!this.passwordData.newPassword) {
        alert('Please enter a new password');
        return false;
      }

      if (this.passwordData.newPassword.length < 6) {
        alert('New password must be at least 6 characters');
        return false;
      }

      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        alert('New passwords do not match');
        return false;
      }
    }

    return true;
  }

  // Save changes
  onSave() {
    if (!this.validatePasswordChange()) {
      return;
    }

    // TODO: Replace with actual API calls
    console.log('Saving profile data:', this.userData);

    if (this.passwordData.newPassword) {
      console.log('Changing password');
      // API call to change password
    }

    if (this.profilePicture !== this.originalProfilePicture) {
      console.log('Updating profile picture');
      // API call to upload new picture
    }

    // Update original data
    this.originalData = { ...this.userData };
    this.originalProfilePicture = this.profilePicture;

    // Clear password fields
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    alert('Profile updated successfully!');
  }

  // Discard changes
  onDiscard() {
    if (confirm('Are you sure you want to discard all changes?')) {
      this.userData = { ...this.originalData };
      this.profilePicture = this.originalProfilePicture;
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
  }

  // Navigation
  goBack() {
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToProfile() {
    this.isMenuOpen = false;
    // Already on profile page
  }

  logout() {
    this.isMenuOpen = false;
    // TODO: Add logout logic
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.isMenuOpen = false;
    this.router.navigate(['/profile']);
  }

}
