import { Component } from '@angular/core';
import {SignupDetail} from '../../dtos/signup';
import {SignupService} from '../../services/signup-service/signup.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Toast, ToastrService} from 'ngx-toastr';

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

  constructor(private signupService: SignupService, private router: Router, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    // This triggers immediately when the page loads#
    this.toastr.success('Hello! The toast is working.', 'System Test');
    this.toastr.error('Hello! The toast is working.', 'System Test');
    this.toastr.info('Hello! The toast is working.', 'System Test');
  }
  onSubmit() {
    this.signupService.signupUser(this.signupData).subscribe({
      next: () => {
        this.toastr.success("Signup successful!");
        this.router.navigate(['/home']); // redirect to login after success
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Signup failed!");
      }
    });
  }
}
