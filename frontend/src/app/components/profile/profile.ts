import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {UserService} from '../../services/user-service/user-service';
import {UserProfileDetail} from '../../dtos/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  // User data
  userData = {
    firstName: '',
    lastName: '',
    email: ''
  };

  // Original data (for comparison)
  originalData = { ...this.userData };

  // Password data
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Profile picture
  profilePicture: string | null = null;
  originalProfilePicture: string | null = null;

  // Menu toggle
  isMenuOpen = false;

  // Delete modal
  showDeleteModal = false;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    // Load user data from API/service here
    const jwtToken = localStorage.getItem('authToken');
    if(!jwtToken) {
      console.error('JWT token not found in local storage');
      return;
    }

    this.loadUserData();
  }

  loadUserData() {


    this.userService.getProfile().subscribe({
      next: (data: UserProfileDetail) => {
        this.userData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        };

        this.originalData = { ...this.userData };

        // this.profilePicture = data.profilePictureUrl || null;
        // this.originalProfilePicture = this.profilePicture;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        if (err.status === 403 || err.status === 401) {
          //this.logout(); commented out for testing purposes
        }
      }
    });
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

  goToProfile() {
    this.isMenuOpen = false;
    // Already on profile page
  }

  logout() {
    this.isMenuOpen = false;
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  deleteProfile() {
    this.showDeleteModal = false;

    // TODO: Add API call to delete profile
    console.log('Deleting profile...');

    // Show confirmation and redirect
    alert('Profile deleted successfully');
    this.router.navigate(['/login']);
  }
}
