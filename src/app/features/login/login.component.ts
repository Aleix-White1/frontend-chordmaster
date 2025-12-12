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
  styleUrls: ['./login.component.scss'],
  standalone: true
})
export class LoginComponent {
  public email: string = '';
  public password: string = '';
  public isLoggedIn: boolean = false;

  private readonly authService = inject(AuthService);
  private readonly routes = inject(Router);

  public onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // Esperar un poco para asegurar que los datos se guarden
        setTimeout(async () => {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            background: '#e7e0d0',
            text: 'You have been logged in successfully!',
            timer: 2000,
            showConfirmButton: false,
          }).then(async () => {
            this.isLoggedIn = true;
            // Verificar que el usuario está logueado antes de navegar
            const isLoggedIn = await this.authService.isLoggedIn();
            console.log('🔍 User logged in status:', isLoggedIn);
            if (isLoggedIn) {
              this.routes.navigate(['/home']);
            } else {
              console.error('❌ Token not found after login');
            }
          });
        }, 100);
      },
      error: (error) => {
        console.error('Login error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password.',
          timer: 2000,
          customClass: {},
        });
        this.isLoggedIn = false;
      },
    });
  }
}
