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
            response.access_token,
            response.refresh_token
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
        console.log('Response has refresh_token:', !!response.refresh_token);
        console.log('Response has access_token:', !!response.access_token);
        this.setUserData(response.name, response.email, response.access_token, response.refresh_token);
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

  public async getAccessToken(): Promise<string | null> {
    const result = await Preferences.get({ key: 'accessToken' });
    console.log('🔑 AuthService.getAccessToken:', {
      hasToken: !!result.value,
      tokenLength: result.value?.length || 0,
      tokenPreview: result.value ? result.value.substring(0, 20) + '...' : null
    });
    return result.value;
  }

  public async isLoggedIn(): Promise<boolean> {
    const result = await Preferences.get({ key: 'accessToken' });
    console.log('🔑 AuthService.isLoggedIn():', {
      hasToken: !!result.value,
      tokenLength: result.value?.length || 0,
      tokenPreview: result.value ? result.value.substring(0, 20) + '...' : null
    });
    return !!result.value;
  }

  public async setUserData(name: string, email: string, accessToken: string, refreshToken?: string) {
    console.log('💾 Saving user data:', {
      name,
      email,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    await Preferences.set({ key: 'name', value: name });
    await Preferences.set({ key: 'email', value: email });
    await Preferences.set({ key: 'accessToken', value: accessToken });
    if (refreshToken) {
      await Preferences.set({ key: 'refreshToken', value: refreshToken });
      console.log('✅ Refresh token saved successfully');
    } else {
      console.log('⚠️ No refresh token provided');
    }
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

  public async logout(): Promise<void> {
    try {
      // Limpiar todas las claves de Preferences
      await Preferences.clear();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  public async debugTokens(): Promise<void> {
    const accessToken = await Preferences.get({ key: 'accessToken' });
    const refreshToken = await Preferences.get({ key: 'refreshToken' });
    const userData = await this.getUserData();

    console.log('=== AUTH DEBUG ===');
    console.log('Access Token:', accessToken.value ? 'EXISTS' : 'MISSING');
    console.log('Access Token length:', accessToken.value?.length || 0);
    console.log('Access Token preview:', accessToken.value ? accessToken.value.substring(0, 50) + '...' : 'null');
    console.log('Refresh Token:', refreshToken.value ? 'EXISTS' : 'MISSING');
    console.log('Refresh Token length:', refreshToken.value?.length || 0);
    console.log('User Data:', userData);
    console.log('=================');
  }

  public async checkAuthStatus(): Promise<void> {
    const isLoggedIn = await this.isLoggedIn();
    const userData = await this.getUserData();

    console.log('🔍 AUTHENTICATION STATUS CHECK 🔍');
    console.log('Is Logged In:', isLoggedIn);
    console.log('Has User Data:', !!userData.name);
    console.log('Has Access Token:', !!userData.accessToken);
    console.log('Token Valid Length:', userData.accessToken ? userData.accessToken.length > 20 : false);
    console.log('=================================');
  }


}
