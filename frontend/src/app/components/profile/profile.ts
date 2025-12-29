import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {UserService} from '../../services/user-service/user-service';
import {EditUserDto, UserProfileDetail} from '../../dtos/user';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  showDiscardModal = false;

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

  constructor(private router: Router, private userService: UserService, private toastr: ToastrService) {}

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
        this.toastr.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB');
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
        this.toastr.error('Please enter your current password');
        return false;
      }

      if (!this.passwordData.newPassword) {
        this.toastr.error('Please enter a new password');
        return false;
      }

      if (this.passwordData.newPassword.length < 6) {
        this.toastr.error('New password must be at least 6 characters');
        return false;
      }

      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.toastr.error('New passwords do not match');
        return false;
      }
    }

    return true;
  }

  onSave() {
    if (!this.validatePasswordChange()) {
      return;
    }

    console.log('Saving profile data:', this.userData);
    const payload: EditUserDto = {
      firstName: this.userData.firstName,
      lastName: this.userData.lastName
    };

    if (this.passwordData.newPassword) {
      payload.oldPassword = this.passwordData.currentPassword;
      payload.newPassword = this.passwordData.newPassword;
    }

    if (this.profilePicture !== this.originalProfilePicture) {
      console.log('Updating profile picture');
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

    this.userService.editProfile(payload).subscribe({
      next: (updatedUser) => {
        console.log('Update successful', updatedUser);

        this.userData.firstName = updatedUser.firstName;
        this.userData.lastName = updatedUser.lastName;

        this.originalData = { ...this.userData };
        this.originalProfilePicture = this.profilePicture;

        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.toastr.success('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);

        if (err.status === 400) {
          this.toastr.error(typeof err.error === 'string' ? err.error : 'Update failed. Please check your inputs.');
        } else {
          this.toastr.error('An unexpected error occurred. Please try again.');
        }
      }
    });

  }

  onDiscard() {
    this.showDiscardModal = true;
  }
  confirmDiscard() {
    // Reset all data to original values
    this.userData = { ...this.originalData };
    this.profilePicture = this.originalProfilePicture;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    this.showDiscardModal = false;

    this.toastr.info('All changes have been discarded', 'Changes Discarded');
  }

  getChangedFields(): string[] {
    const changes: string[] = [];

    if (this.hasChanges('firstName')) changes.push('First Name');
    if (this.hasChanges('lastName')) changes.push('Last Name');
    if (this.passwordData.currentPassword || this.passwordData.newPassword) {
      changes.push('Password');
    }
    if (this.profilePicture !== this.originalProfilePicture) {
      changes.push('Profile Picture');
    }

    return changes;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToProfile() {
    this.isMenuOpen = false;
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
    this.toastr.error('Profile deleted successfully');
    this.router.navigate(['/login']);
  }
}
