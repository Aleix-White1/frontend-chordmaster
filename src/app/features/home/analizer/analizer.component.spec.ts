import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalizerComponent } from './analizer.component';
import { AnalizerService } from '../../../core/services/analizer.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('AnalizerComponent', () => {
  let component: AnalizerComponent;
  let fixture: ComponentFixture<AnalizerComponent>;

  beforeEach(async () => {
    const analizerSpy = jasmine.createSpyObj('AnalizerService', ['getAnalysisData', 'getHistory'], {
      analysisData$: of(null)
    });
    analizerSpy.getHistory.and.returnValue(of({ history: [] }));

    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUserData']);
    authSpy.getUserData.and.returnValue(Promise.resolve({
      name: 'Test User',
      email: 'test@example.com',
      accessToken: 'token'
    }));

    await TestBed.configureTestingModule({
      imports: [AnalizerComponent],
      providers: [
        { provide: AnalizerService, useValue: analizerSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.analysisData).toBeNull();
    expect(component.chords).toEqual([]);
    expect(component.isPlaying).toBeFalsy();
  });

  it('should format time correctly', () => {
    expect(component.formatTime(65)).toBe('1:05');
    expect(component.formatTime(125)).toBe('2:05');
  });

  it('should get current chord index', () => {
    expect(component.getCurrentChordIndex()).toBe(-1);
  });
});
