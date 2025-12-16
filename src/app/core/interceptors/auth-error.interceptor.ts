import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../env/pre.env';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private readonly refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('🔍 AuthErrorInterceptor - Error intercepted:', {
          status: error.status,
          url: error.url,
          message: error.message
        });

        if (error.status === 401 && !request.url.includes('/auth/login')) {
          console.log('🔄 AuthErrorInterceptor - Handling 401 error, attempting token refresh');
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((token: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);

          console.log('✅ Token refreshed successfully - retrying original request');

          // Clonar la request original con el nuevo token
          const newRequest = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${token}`)
          });

          return next.handle(newRequest);
        }),
        catchError((error) => {
          console.log('❌ Token refresh failed - logging out user');
          this.isRefreshing = false;

          // Limpiar tokens y redirigir al login
          this.authService.logout();
          this.router.navigate(['/login']);

          return throwError(() => new Error('Token refresh failed - please login again'));
        })
      );
    } else {
      // Si ya se está refrescando, esperar al resultado
      console.log('⏳ Token refresh in progress - waiting for completion');
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          const newRequest = request.clone({
            headers: request.headers.set('Authorization', `Bearer ${token}`)
          });
          return next.handle(newRequest);
        })
      );
    }
  }

  private refreshToken(): Observable<string> {
    console.log('🔄 AuthErrorInterceptor - Attempting to refresh token');

    return new Observable<string>(observer => {
      Preferences.get({ key: 'refreshToken' }).then(refreshTokenResult => {
        const refreshToken = refreshTokenResult.value;

        console.log('🔄 Attempting token refresh...');
        console.log('Refresh token exists:', !!refreshToken);

        if (!refreshToken) {
          console.error('❌ AuthErrorInterceptor - No refresh token available');
          observer.error(new Error('No refresh token available'));
          return;
        }

        console.log('📤 Making refresh request to:', 'http://localhost:8000/api/auth/refresh');
        console.log('🔑 Using refresh token:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'null');

        // Intentar con el refresh token en el header Authorization
        console.log('📦 Sending refresh token in Authorization header');

        // Enviar el refresh token en el header Authorization
        this.http.post<any>(`${environment.apiUrl}/api/auth/refresh`, {}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          }
        }).subscribe({
          next: (data) => {
            console.log('✅ Refresh response received:', {
              hasAccessToken: !!data.access_token,
              hasRefreshToken: !!data.refresh_token
            });

            // Guardar los nuevos tokens de forma asíncrona
            this.saveTokensAndNotify(data, observer);
          },
          error: (error) => {
            console.log('📥 Refresh response status:', error.status);
            console.log('📥 Refresh response ok:', error.ok);

            if (error.error) {
              console.log('📥 Refresh failed with body:', error.error);
            }

            console.log('❌ Token refresh error - logging out user');
            observer.error(error);
          }
        });
      }).catch(error => {
        console.error('❌ AuthErrorInterceptor - Error getting refresh token:', error);
        observer.error(error);
      });
    });
  }

  private async saveTokensAndNotify(data: any, observer: any): Promise<void> {
    try {
      // Guardar los nuevos tokens
      await Preferences.set({ key: 'accessToken', value: data.access_token });
      if (data.refresh_token) {
        await Preferences.set({ key: 'refreshToken', value: data.refresh_token });
      }

      observer.next(data.access_token);
      observer.complete();
    } catch (error) {
      console.error('❌ AuthErrorInterceptor - Error saving tokens:', error);
      observer.error(error);
    }
  }
}
