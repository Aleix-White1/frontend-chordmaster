import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  public name: string = '';
  public email: string = '';
  public password: string = '';

  private readonly authService = inject(AuthService);
  private readonly routes = inject(Router);

  constructor() {}

  onSubmit() {
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
          console.log('Registration successful:', response);
        this.routes.navigate(['/login']);
      },
      error: (error) => {
       throw new Error('Registration failed: ' + error.message);
      }
    });
  }
}
