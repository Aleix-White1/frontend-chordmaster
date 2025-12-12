import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.authService.isLoggedIn();
    console.log('🛡️ AuthGuard - checking access:', { isLoggedIn });

    if (isLoggedIn) {
      console.log('✅ AuthGuard - access granted');
      return true;
    }

    console.log('❌ AuthGuard - access denied, redirecting to login');
    this.router.navigate(['/login']);
    return false;
  }
}
