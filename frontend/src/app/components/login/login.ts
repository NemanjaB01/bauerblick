import {Component} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import {AuthRequest} from '../../dtos/auth-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login{
  email = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) { }


  onSubmit() {
    this.auth.loginUser(new AuthRequest(this.email, this.password))
      .subscribe({
      next: () => this.router.navigate(['/signup']),
      error: err => this.errorMessage = 'Invalid email or password'
    });
  }
}
