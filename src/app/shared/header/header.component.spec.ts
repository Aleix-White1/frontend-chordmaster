import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/services/auth.service';
import { AnalizerService } from '../../core/services/analizer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout', 'getUserData']);
    authSpy.getUserData.and.returnValue(Promise.resolve({
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'token'
    }));
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        {
          provide: AnalizerService,
          useValue: {
            ...jasmine.createSpyObj('AnalizerService', ['clearAnalysisData', 'getHistory']),
            getHistory: () => of({ history: [] })
          }
        },
        { provide: Router, useValue: routerSpyObj }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sidepanel closed', () => {
    expect(component.isSidepanelOpen).toBeFalsy();
  });

  it('should open sidepanel', () => {
    expect(component.isSidepanelOpen).toBeFalsy();

    component.openSidePanel();
    expect(component.isSidepanelOpen).toBeTruthy();
  });

  it('should close sidepanel', () => {
    component.isSidepanelOpen = true;

    component.closeSidePanel();
    expect(component.isSidepanelOpen).toBeFalsy();
  });

  it('should logout', () => {
    component.onLogOut();

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should initialize user data', async () => {
    authServiceSpy.getUserData.and.returnValue(Promise.resolve({
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'token'
    }));

    component.ngOnInit();

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.currentUser).toBe('Test User');
  });
});
