import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔍 RequestInterceptor - Processing request to:', req.url);

    return from(Preferences.get({ key: 'accessToken' })).pipe(
      switchMap((accessToken) => {
        console.log('🔑 RequestInterceptor - Token retrieved:', {
          hasToken: !!accessToken.value,
          tokenLength: accessToken.value ? accessToken.value.length : 0,
          tokenStart: accessToken.value ? accessToken.value.substring(0, 20) + '...' : 'null'
        });

        if (accessToken.value) {
          const request = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken.value}`),
          });
          console.log('✅ RequestInterceptor - Added Authorization header');
          return next.handle(request);
        }

        console.log('❌ RequestInterceptor - No token found, proceeding without Authorization header');
        return next.handle(req);
      })
    );
  }
}
