import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  private readonly authService = inject(AuthService);
  private readonly routes = inject(Router);

  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
  });

  constructor() {}

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.nameValue!, this.emailValue!, this.passwordValue!).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          Swal.fire({
            icon: 'success',
            title: '🎵 ¡Cuenta Creada!',
            html: '¡Tu perfil musical está listo!<br><strong>🎼 Ahora inicia sesión para comenzar 🎼</strong>',
            background: '#e7e0d0', // fossil
            color: '#675a4f', // stone-brown
            confirmButtonColor: '#675a4f',
            confirmButtonText: 'Ir al Login 🎶',
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm'
            }
          }).then(() => {
            this.routes.navigate(['/login']);
          });
        },
        error: (error) => {
          console.error('Registration error:', error);
          Swal.fire({
            icon: 'error',
            title: '🎵 Error en el Registro',
            html: 'No pudimos crear tu cuenta musical...<br><strong>Verifica los datos e intenta de nuevo</strong>',
            background: '#e7e0d0', // fossil
            color: '#675a4f', // stone-brown
            confirmButtonColor: '#d73527', // error red
            confirmButtonText: 'Intentar de Nuevo',
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-error'
            }
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: '🎵 Formulario Incompleto',
        html: 'Completa todos los campos para crear tu perfil musical<br><strong>🎼 Revisa la información requerida 🎼</strong>',
        background: '#e7e0d0', // fossil
        color: '#675a4f', // stone-brown
        confirmButtonColor: '#bda897', // cost-wold
        confirmButtonText: 'Entendido',
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-cancel'
        }
      });
    }
  }

  get nameValue() {
    return this.registerForm.get('name')?.value;
  }

  get emailValue() {
    return this.registerForm.get('email')?.value;
  }

  get passwordValue() {
    return this.registerForm.get('password')?.value;
  }

  // Getters para acceder a los FormControls (para validación en template)
  get nameControl() {
    return this.registerForm.get('name');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }
}
