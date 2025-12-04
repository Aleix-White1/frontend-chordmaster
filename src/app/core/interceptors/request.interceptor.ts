import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(Preferences.get({ key: 'accessToken' })).pipe(
      switchMap((accessToken) => {
        console.log('Interceptor token:', accessToken.value);
        if (accessToken.value) {
          const request = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${accessToken.value}`),
          });
          return next.handle(request);
        }
        return next.handle(req);
      })
    );
  }
}
