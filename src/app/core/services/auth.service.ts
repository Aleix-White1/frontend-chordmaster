import { Injectable } from '@angular/core';
import { environment } from '../../../env/pre.env';
import { HttpClient } from '@angular/common/http';
import { catchError, from, of, switchMap, throwError } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import {RegisterResponse} from '../models/auth-service.models';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly EMAIL_KEY = 'email';

  private readonly baseURL = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  async saveUserData(email: string, access_token: string) {
    await Preferences.set({
      key: this.EMAIL_KEY,
      value: email
    });
    await Preferences.set({
      key: this.ACCESS_TOKEN_KEY,
      value: access_token
    });
  }

  register(name: string, email: string, password: string) {
    const requestBody = { name, email, password };
    return this.http.post<RegisterResponse>(`${this.baseURL}/api/auth/register`, requestBody).pipe(
      switchMap((response: RegisterResponse) => {
        return from(this.saveUserData(response.email, response.access_token)).pipe(
          switchMap(() => [response])
        );
      }),
      catchError((error) => {
        console.error('Registration failed:', error);
        return throwError(() => error);
      })
    );
  }

  get userEmail(): Promise<string | null> {
    return Preferences.get({ key: 'email' }).then(result => result.value);
  }



  // Método para iniciar sesión
  login(username: string, password: string): void {
    return {username, password} as any;
  }

  // Método para cerrar sesión
  logout(): void {
    // Lógica de cierre de sesión aquí
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    // Lógica para comprobar autenticación
    return false;
  }
}
