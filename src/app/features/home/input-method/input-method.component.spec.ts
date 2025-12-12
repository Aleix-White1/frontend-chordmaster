import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputMethodComponent } from './input-method.component';
import { AnalizerService } from '../../../core/services/analizer.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('InputMethodComponent', () => {
  let component: InputMethodComponent;
  let fixture: ComponentFixture<InputMethodComponent>;

  beforeEach(async () => {
    const analizerSpy = jasmine.createSpyObj('AnalizerService', ['analyzeLink', 'analizeFile', 'getHistory']);
    analizerSpy.getHistory.and.returnValue(of({ history: [] }));

    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUserData']);
    authSpy.getUserData.and.returnValue(Promise.resolve({
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'token'
    }));
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide', 'getSpinner']);
    spinnerSpy.getSpinner.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [InputMethodComponent, NgxSpinnerModule, NoopAnimationsModule],
      providers: [
        { provide: AnalizerService, useValue: analizerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ type: 'youtube' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InputMethodComponent);
    component = fixture.componentInstance;

    const mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockAuthService.isLoggedIn.and.returnValue(Promise.resolve(true));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with query params', () => {
    expect(component.inputType).toBe('youtube');
  });

  it('should set input type', () => {
    component.setInputType('file');
    expect(component.inputType).toBe('file');
  });

  it('should clear youtube link', () => {
    component.youtubeLink.setValue('https://youtube.com/watch?v=test');
    component.clearYoutubeLink();
    expect(component.youtubeLink.value).toBe('');
  });
});
