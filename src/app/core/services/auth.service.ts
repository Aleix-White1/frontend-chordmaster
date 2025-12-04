import { Injectable } from '@angular/core';
import { environment } from '../../../env/pre.env';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { RegisterResponse } from '../models/auth-service.models';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseURL = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  public register(name: string, email: string, password: string) {
    const requestBody = { name, email, password };
    return this.http
      .post<RegisterResponse>(`${this.baseURL}/api/auth/register`, requestBody)
      .pipe(
        tap((response: RegisterResponse) => {
          this.setUserData(
            response.user,
            response.email,
            response.access_token
          );
        }),
        catchError((error) => {
          console.error('Registration failed:', error);
          return throwError(() => error);
        })
      );
  }

  public login(email: string, password: string) {
    const requestBody = { email, password };
    return this.http.post(`${this.baseURL}/api/auth/login`, requestBody).pipe(
      tap((response: any) => {
        console.log('AuthService login response:', response);
        this.setUserData(response.name, response.email, response.access_token);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  public get userEmail(): Promise<string | null> {
    return Promise.resolve(localStorage.getItem('email'));
  }

  public get accessToken(): Promise<string | null> {
    return Promise.resolve(localStorage.getItem('accessToken'));
  }

  public async isLoggedIn(): Promise<boolean> {
    const result = await Preferences.get({ key: 'accessToken' });
    return !!result.value;
  }

  public async setUserData(name: string, email: string, accessToken: string) {
    await Preferences.set({ key: 'name', value: name });
    await Preferences.set({ key: 'email', value: email });
    await Preferences.set({ key: 'accessToken', value: accessToken });
  }

  public async getUserData(): Promise<{
    name: string | null;
    email?: string | null;
    accessToken?: string | null;
  }> {
    const name = await Preferences.get({ key: 'name' });
    const email = await Preferences.get({ key: 'email' });
    const accessToken = await Preferences.get({ key: 'accessToken' });
    return {
      name: name.value,
      email: email.value,
      accessToken: accessToken.value,
    };
  }

  logout(): void {
    // Lógica de cierre de sesión aquí
  }


}
