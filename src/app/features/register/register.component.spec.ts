import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.nameValue).toBe('');
    expect(component.emailValue).toBe('');
    expect(component.passwordValue).toBe('');
  });

  it('should validate required fields', () => {
    const nameControl = component.nameControl;
    const emailControl = component.emailControl;
    const passwordControl = component.passwordControl;

    expect(nameControl?.valid).toBeFalsy();
    expect(emailControl?.valid).toBeFalsy();
    expect(passwordControl?.valid).toBeFalsy();

    nameControl?.setValue('Test User');
    emailControl?.setValue('test@example.com');
    passwordControl?.setValue('password123');

    expect(nameControl?.valid).toBeTruthy();
    expect(emailControl?.valid).toBeTruthy();
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate name minimum length', () => {
    const nameControl = component.registerForm.get('name');

    nameControl?.setValue('abc');
    expect(nameControl?.hasError('minlength')).toBeTruthy();

    nameControl?.setValue('abcd');
    expect(nameControl?.hasError('minlength')).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');

    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });

  it('should call AuthService.register with correct parameters', () => {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password123';

    authServiceSpy.register.and.returnValue(of({
      email: 'test@example.com',
      user: 'Test User',
      access_token: 'mock-token'
    }));

    component.registerForm.patchValue({ name, email, password });
    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith(name, email, password);
  });

  it('should handle successful registration', () => {
    authServiceSpy.register.and.returnValue(of({
      email: 'test@example.com',
      user: 'Test User',
      access_token: 'mock-token'
    }));

    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Mock SweetAlert
    spyOn(window, 'alert');

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalled();
  });

  it('should handle registration error', () => {
    authServiceSpy.register.and.returnValue(throwError({ status: 400, message: 'Bad Request' }));

    component.registerForm.patchValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    spyOn(console, 'error');
    component.onSubmit();

    expect(console.error).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.registerForm.patchValue({
      name: 'ab', // too short
      email: 'invalid-email',
      password: '123' // too short
    });

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should get form values correctly', () => {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'testpassword';

    component.registerForm.patchValue({ name, email, password });

    expect(component.nameValue).toBe(name);
    expect(component.emailValue).toBe(email);
    expect(component.passwordValue).toBe(password);
  });
});
