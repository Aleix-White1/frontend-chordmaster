import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../core/services/auth.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spies for services
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserData', 'isLoggedIn', 'login', 'register', 'logout', 'getAccessToken']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Configure AuthService spy behaviors
    mockAuthService.getUserData.and.returnValue(Promise.resolve({ accessToken: 'test-token', name: 'Test User', email: 'test@example.com' }));
    mockAuthService.isLoggedIn.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [HomeComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to input-method with type parameter', () => {
    // Act
    component.redirectPage('youtube');

    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/input-method'], { queryParams: { type: 'youtube' } });
  });

  it('should redirect to input-method with file type', () => {
    // Act
    component.redirectPage('file');

    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/input-method'], { queryParams: { type: 'file' } });
  });
});
