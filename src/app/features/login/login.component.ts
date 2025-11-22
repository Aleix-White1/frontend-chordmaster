import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public email: string = '';
  public password: string = '';
  public isLoggedIn: boolean = false;

  private readonly authService = inject(AuthService);
  private readonly routes = inject(Router);

  public onSubmit() {
    console.log(this.email, this.password);

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response.name);
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You have been logged in successfully!',
          timer: 2000,
        });
        this.routes.navigate(['/home']);
        this.isLoggedIn = true;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoggedIn = false;
      }
    });
  }

}
