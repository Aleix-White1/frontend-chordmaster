import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalizerService } from '../../../core/services/analizer.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {NgxSpinnerModule, NgxSpinnerService}  from "ngx-spinner";

@Component({
  selector: 'app-input-method',
  standalone: true,
  imports: [HeaderComponent, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './input-method.component.html',
  styleUrls: ['./input-method.component.scss']
})
export class InputMethodComponent implements OnInit, OnDestroy {

  public inputType: string = '';
  public selectedFileName: string = '';
  public youtubeLink: FormControl = new FormControl('');
  private readonly subscription: Subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly analizerService: AnalizerService,
    private readonly authService: AuthService,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        this.inputType = params['type'] || '';
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public setInputType(type: string): void {

    this.inputType = type;
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
    }
  }

  public async analizePaste(): Promise<void> {
    this.spinner.show();

    // Verificar autenticación
    console.log('🔍 Checking authentication...');
    await this.authService.debugTokens();
    const isLoggedIn = await this.authService.isLoggedIn();

    if (!isLoggedIn) {
      console.error('❌ User not authenticated - redirecting to login');
      this.spinner.hide();
      this.router.navigate(['/login']);
      return;
    }
    console.log('✅ User is authenticated');

    // Verificar token específicamente para el análisis
    const userData = await this.authService.getUserData();
    console.log('📊 User data before analysis:', {
      hasName: !!userData.name,
      hasEmail: !!userData.email,
      hasAccessToken: !!userData.accessToken,
      tokenPreview: userData.accessToken ? userData.accessToken.substring(0, 30) + '...' : 'null'
    });

    const url = this.youtubeLink.value;
    console.log('Sending URL to analize:', url);

    // Verificación final del token antes de la llamada
    await this.authService.checkAuthStatus();

    this.analizerService.analyzeLink(url as string).subscribe({
      next: (response) => {
        console.log('✅ Analysis response:', response);
        const analysisData = {
          key: response.analysis.key,
          tempo_bpm: response.analysis.tempo_bpm,
          chords: response.analysis.chords,
          title: response.analysis.title || 'Análisis de Audio',
          job_id: response.job_id
        };

        // Establecer datos de análisis
        this.analizerService.setAnalysisData(analysisData);

        // El backend guarda automáticamente en el historial
        console.log('✅ Analysis completed, backend should have saved to history automatically');

        this.spinner.hide();
        this.router.navigate(['/analizer']);
      },
      error: (error) => {
        console.error('Analysis error:', error);
        this.spinner.hide();
      }
    });
  }

  public sendToAnalize(): void {
    if (this.inputType === 'file') {
      this.analizeFile();
    } else {
      this.analizePaste();
    }
  }

  public async analizeFile(): Promise<void> {
    // Obtener el archivo seleccionado
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput?.files || fileInput.files.length === 0) {
      console.error('No file selected');
      return;
    }

    const selectedFile = fileInput.files[0];
    this.spinner.show();

    // Verificar autenticación
    console.log('🔍 Checking authentication for file analysis...');
    const isLoggedIn = await this.authService.isLoggedIn();

    if (!isLoggedIn) {
      console.error('❌ User not authenticated - redirecting to login');
      this.spinner.hide();
      this.router.navigate(['/login']);
      return;
    }
    console.log('✅ User is authenticated for file analysis');

    this.analizerService.analizeFile(selectedFile).subscribe({
      next: (response) => {
        console.log('✅ File Analysis response:', response);
        const analysisData = {
          key: response.analysis.key,
          tempo_bpm: response.analysis.tempo_bpm,
          chords: response.analysis.chords,
          title: response.analysis.title || selectedFile.name || 'Análisis de Archivo',
          job_id: response.job_id
        };

        // Establecer datos de análisis
        this.analizerService.setAnalysisData(analysisData);

        // El backend guarda automáticamente en el historial
        console.log('✅ File analysis completed, backend should have saved to history automatically');

        this.spinner.hide();
        this.router.navigate(['/analizer']);
      },
      error: (error) => {
        console.error('File analysis error:', error);
        this.spinner.hide();
      }
    });
  }
}
