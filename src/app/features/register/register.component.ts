import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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

  registerForm = new FormGroup({
    name: new FormControl(this.name, [
      Validators.required,
      Validators.minLength(4),
    ]),
    email: new FormControl(this.email, [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl(this.password, [
      Validators.required,
      Validators.minLength(6)
    ]),
  });

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

  get nameForm()
  {
    return this.registerForm.get('name')?.value;
  }

  get emailForm()
  {
    return this.registerForm.get('email')?.value;
  }

  get passwordForm()
  {
    return this.registerForm.get('password')?.value;
  }
}
