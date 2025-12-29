import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import {AuthRequest} from '../../dtos/auth-request';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  loginFailed = false; // 1. Add this flag
  showPassword = false;

  constructor(private auth: AuthService, private router: Router, private toastr: ToastrService) { }

  onSubmit() {
    this.loginFailed = false; // Reset error state on new attempt

    this.auth.loginUser(new AuthRequest(this.email, this.password))
      .subscribe({
        next: () => {
          this.toastr.success("Successfully signed in!");
          this.router.navigate(['/signup']);
        },
        error: err => {
          this.loginFailed = true; // 2. Turn inputs red
          this.toastr.error("Please check your credentials.", "Login failed"); // 3. Show toast
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


}
