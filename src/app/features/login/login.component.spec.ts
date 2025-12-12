import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty fields', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should handle user input', () => {
    component.email = 'test@example.com';
    component.password = 'password123';

    expect(component.email).toBe('test@example.com');
    expect(component.password).toBe('password123');
  });

  it('should call AuthService.login with correct parameters', () => {
    const email = 'test@example.com';
    const password = 'password123';

    authServiceSpy.login.and.returnValue(of({ access_token: 'mock-token' }));

    component.email = email;
    component.password = password;
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith(email, password);
  });

  it('should handle login error', () => {
    authServiceSpy.login.and.returnValue(throwError({ status: 401, message: 'Unauthorized' }));

    component.email = 'test@example.com';
    component.password = 'wrongpassword';

    spyOn(console, 'error');
    component.onSubmit();

    expect(console.error).toHaveBeenCalled();
  });
});
