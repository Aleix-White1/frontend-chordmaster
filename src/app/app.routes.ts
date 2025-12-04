import { Routes } from '@angular/router';
import { RegisterComponent } from './features/register/register.component';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { InputMethodComponent } from './features/home/input-method/input-method.component';
import { AnalizerComponent } from './features/home/analizer/analizer.component';
import { AuthGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'input-method',
    component: InputMethodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'analizer',
    component: AnalizerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login',
  }
];
