import { Component } from '@angular/core';
import {SignupDetail} from '../../dtos/signup';
import {SignupService} from '../../services/signup-service/signup.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-signup.ts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  signupData: SignupDetail = {
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    address: '',
    password: '',
    password2: ''
  };

  constructor(private signupService: SignupService, private router: Router) {
  }

  onSubmit() {
    this.signupService.signupUser(this.signupData).subscribe({
      next: () => {
        alert("Signup successful!");
        this.router.navigate(['/home']); // redirect to login after success
      },
      error: (err) => {
        console.error(err);
        alert("Signup failed!");
      }
    });
  }
}
