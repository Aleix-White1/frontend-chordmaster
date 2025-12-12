import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AnalizerService, ChordData, AnalysisResult } from '../../../core/services/analizer.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import WaveSurfer from 'wavesurfer.js';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-analizer',
  standalone: true,
  imports: [HeaderComponent, CommonModule],
  templateUrl: './analizer.component.html',
  styleUrls: ['./analizer.component.scss'],
})
export class AnalizerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('waveformContainer', { static: false }) waveformContainer!: ElementRef;
  @ViewChild('chordsTimelineContainer', { static: false }) chordsTimelineContainer!: ElementRef;

  // Estados públicos para el template
  public tone: string = '';
  public tempo: number | undefined;
  public currentChord: string = '';
  public previousChord: string = '';
  public nextChord: string = '';
  public currentBar: number | null = null;
  public isPlaying: boolean = false;
  public currentTime: number = 0;
  public duration: number = 0;
  public title: string = '';

  // Datos de análisis
  public analysisData: AnalysisResult | null = null;
  public chords: ChordData[] = [];

  // WaveSurfer
  public wavesurfer: WaveSurfer | null = null;
  public audioUrl: string = '';
  public isWaveSurferReady: boolean = false;

  // Control de componente
  private readonly destroy$ = new Subject<void>();
  private timeUpdateInterval: any;

  constructor(
    private readonly analysisDataService: AnalizerService,
    private readonly ngZone: NgZone,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los datos de análisis
    this.analysisDataService.analysisData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        console.log('📊 Analizer component received data:', data);
        if (data) {
          // Resetear componente antes de cargar nuevos datos
          if (this.wavesurfer) {
            this.wavesurfer.destroy();
            this.wavesurfer = null;
            this.isWaveSurferReady = false;
          }

          this.analysisData = data;
          this.tone = data.key || 'Desconocido';
          this.tempo = data.tempo_bpm ? Math.round(data.tempo_bpm) : undefined;
          console.log('🎵 Title received in analizer:', data.title);
          this.title = data.title || 'Análisis de Audio';

          // Validar que los acordes sean un array
          console.log('🎵 Raw chords data:', data.chords);
          console.log('🎵 Chords type:', typeof data.chords);
          console.log('🎵 Is array:', Array.isArray(data.chords));

          let chords = data.chords;

          // Si es un string (JSON serializado), parsearlo
          if (typeof chords === 'string') {
            try {
              console.log('🔄 Parsing chords from JSON string...');
              chords = JSON.parse(chords);
              console.log('✅ Chords parsed successfully:', chords);
            } catch (error) {
              console.error('❌ Error parsing chords JSON:', error);
              chords = [];
            }
          }

          if (Array.isArray(chords)) {
            this.chords = chords;
          } else {
            console.warn('⚠️ Chords data is not an array after processing, initializing empty array');
            this.chords = [];
          }

          // Si tenemos un job_id, construir la URL del audio
          if (data.job_id) {
            // Probar diferentes rutas de audio
            this.audioUrl = `http://localhost:8000/api/analyze/audio/${data.job_id}`;
            console.log('🎵 Audio URL constructed:', this.audioUrl);

            // Forzar la re-inicialización de WaveSurfer
            setTimeout(() => {
              this.initializeWaveSurferIfReady();
            }, 100);
          } else {
            console.warn('⚠️ No job_id in analysis data');
          }
        } else {
          console.log('❌ No analysis data received');
          this.resetComponent();
        }
      });
  }

  ngAfterViewInit(): void {
    // Si ya tenemos datos cuando se inicializa la vista, inicializar WaveSurfer
    if (this.analysisData?.job_id) {
      this.initializeWaveSurferIfReady();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
  }

  private async initializeWaveSurferIfReady(): Promise<void> {
    console.log('🔄 Checking WaveSurfer initialization conditions...');
    console.log('  - Container:', !!this.waveformContainer?.nativeElement);
    console.log('  - Audio URL:', this.audioUrl);
    console.log('  - WaveSurfer exists:', !!this.wavesurfer);

    if (this.waveformContainer?.nativeElement && this.audioUrl && !this.wavesurfer) {
      // Asegurar que el contenedor tenga dimensiones
      const container = this.waveformContainer.nativeElement;
      console.log('  - Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);

      if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        console.log('✅ Initializing WaveSurfer...');
        await this.initializeWaveSurfer();
      } else {
        console.log('⏳ Container has no dimensions, retrying...');
        // Reintentar después de un breve delay
        setTimeout(() => this.initializeWaveSurferIfReady(), 100);
      }
    }
  }

  private async initializeWaveSurfer(): Promise<void> {
    console.log('🎼 Creating WaveSurfer instance...');

    // Destruir instancia anterior si existe
    if (this.wavesurfer) {
      console.log('🗑️ Destroying previous WaveSurfer instance');
      this.wavesurfer.destroy();
    }

    try {
      // Obtener el token de autenticación desde Preferences
      const token = await this.authService.getAccessToken();
      console.log('🔑 Using auth token:', token ? 'Token present' : 'No token');

      // Crear nueva instancia de WaveSurfer
      this.wavesurfer = WaveSurfer.create({
        container: this.waveformContainer.nativeElement,
        waveColor: '#8B4513',
        progressColor: '#D2691E',
        cursorColor: '#FF4500',
        barWidth: 3,
        barGap: 2,
        barRadius: 3,
        height: 128,
        normalize: true,
        mediaControls: false,
        interact: true,
        hideScrollbar: false,
        url: this.audioUrl,
        fetchParams: {
          credentials: 'include',
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        }
      });

      console.log('✅ WaveSurfer instance created successfully');

      // Eventos de WaveSurfer (actualizan el estado dentro del NgZone)
      this.wavesurfer.on('ready', () => {
        console.log('🎉 WaveSurfer ready event fired');
        this.ngZone.run(() => {
          this.isWaveSurferReady = true;
          this.duration = this.wavesurfer?.getDuration() || 0;
          console.log('⏱️ Duration:', this.duration);
          this.setupTimeTracking();
        });
      });

      this.wavesurfer.on('play', () => {
        console.log('▶️ Playing');
        this.ngZone.run(() => { this.isPlaying = true; });
      });

      this.wavesurfer.on('pause', () => {
        console.log('⏸️ Paused');
        this.ngZone.run(() => { this.isPlaying = false; });
      });

      this.wavesurfer.on('finish', () => {
        console.log('🏁 Finished');
        this.ngZone.run(() => {
          this.isPlaying = false;
          this.currentTime = 0;
          this.currentChord = '';
        });
      });

      this.wavesurfer.on('error', (error) => {
        console.error('❌ WaveSurfer error:', error);
        this.ngZone.run(() => {
          this.isWaveSurferReady = false;
          // Reintentar carga después de un error
          setTimeout(async () => {
            console.log('🔄 Retrying WaveSurfer initialization after error...');
            await this.initializeWaveSurfer();
          }, 2000);
        });
      });

      this.wavesurfer.on('audioprocess', () => {
        if (this.wavesurfer) {
          this.ngZone.run(() => {
            this.currentTime = this.wavesurfer!.getCurrentTime();
            this.updateCurrentChord();
          });
        }
      });

      this.wavesurfer.on('seeking', () => {
        if (this.wavesurfer) {
          this.ngZone.run(() => {
            this.currentTime = this.wavesurfer!.getCurrentTime();
            this.updateCurrentChord();
          });
        }
      });

    } catch (error) {
      console.error('❌ Error creating WaveSurfer:', error);
    }
  }

  private setupTimeTracking(): void {
    // Limpiar intervalo anterior
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    // Actualizar tiempo cada 100ms
    this.timeUpdateInterval = setInterval(() => {
      if (this.wavesurfer) {
        this.ngZone.run(() => {
          this.currentTime = this.wavesurfer!.getCurrentTime();
          this.updateCurrentChord();
        });
      }
    }, 100);
  }

  private updateCurrentChord(): void {
    if (!Array.isArray(this.chords) || this.chords.length === 0) {
      if (!Array.isArray(this.chords)) {
        console.error('❌ this.chords is not an array in updateCurrentChord:', this.chords);
      }
      this.resetChordDisplay();
      return;
    }

    const currentChordIndex = this.findCurrentChordIndex();
    this.updateChordDisplay(currentChordIndex);
  }

  private findCurrentChordIndex(): number {
    if (!Array.isArray(this.chords)) {
      console.error('❌ this.chords is not an array:', this.chords);
      return -1;
    }
    return this.chords.findIndex(chord =>
      this.currentTime >= chord.start_time && this.currentTime < chord.end_time
    );
  }

  public getCurrentChordIndex(): number {
    return this.findCurrentChordIndex();
  }  private updateChordDisplay(currentChordIndex: number): void {
    if (currentChordIndex !== -1) {
      const currentChord = this.chords[currentChordIndex];
      this.currentChord = currentChord.chord;
      this.previousChord = currentChord.prevChord || '';
      this.nextChord = currentChord.nextChord || '';
      this.currentBar = currentChord.bar;

      // Scroll automático al acorde actual
      this.scrollToCurrentChord(currentChordIndex);
    } else {
      this.setChordsForNoCurrentChord();
      this.currentBar = null;
    }
  }

  private setChordsForCurrentIndex(index: number): void {
    this.currentChord = this.chords[index].chord;
    this.previousChord = index > 0 ? this.chords[index - 1].chord : '';
    this.nextChord = index < this.chords.length - 1 ? this.chords[index + 1].chord : '';
  }

  private setChordsForNoCurrentChord(): void {
    const nextChordIndex = this.chords.findIndex(chord => chord.start_time > this.currentTime);
    if (nextChordIndex !== -1) {
      this.currentChord = '';
      this.previousChord = nextChordIndex > 0 ? this.chords[nextChordIndex - 1].chord : '';
      this.nextChord = this.chords[nextChordIndex].chord;
    } else {
      this.currentChord = '';
      this.previousChord = this.chords.length > 0 ? this.chords[this.chords.length - 1].chord : '';
      this.nextChord = '';
    }
  }

  private resetChordDisplay(): void {
    this.currentChord = '';
    this.previousChord = '';
    this.nextChord = '';
    this.currentBar = null;
  }

  // Métodos públicos para controlar la reproducción
  public togglePlayPause(): void {
    if (!this.wavesurfer) {
      return;
    }

    if (this.isPlaying) {
      this.wavesurfer.pause();
    } else {
      this.wavesurfer.play();
    }
  }

  public skipBackward(): void {
    if (!this.wavesurfer) {
      return;
    }

    const newTime = Math.max(0, this.currentTime - 15);
    const percentage = (newTime / this.duration) * 100;
    this.wavesurfer.seekTo(percentage / 100);
  }

  public skipForward(): void {
    if (!this.wavesurfer) {
      return;
    }

    const newTime = Math.min(this.duration, this.currentTime + 15);
    const percentage = (newTime / this.duration) * 100;
    this.wavesurfer.seekTo(percentage / 100);
  }

  public seekTo(percentage: number): void {
    if (!this.wavesurfer) {
      return;
    }

    this.wavesurfer.seekTo(percentage / 100);
  }

  public onProgressBarClick(event: MouseEvent): void {
    if (!this.wavesurfer) {
      return;
    }

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;

    this.seekTo(percentage);
  }

  public formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  public getCurrentProgress(): number {
    if (!this.duration || this.duration === 0) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  private resetComponent(): void {
    this.tone = '';
    this.tempo = undefined;
    this.currentChord = '';
    this.previousChord = '';
    this.nextChord = '';
    this.currentBar = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.title = '';
    this.analysisData = null;
    this.chords = [];
    this.audioUrl = '';
    this.isWaveSurferReady = false;

    if (this.wavesurfer) {
      this.wavesurfer.destroy();
      this.wavesurfer = null;
    }

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  // TrackBy function para mejorar performance
  public trackByChord(index: number, chord: ChordData): string {
    return `${chord.chord}-${chord.start_time}`;
  }

  // Método para obtener la barra actual
  public getCurrentBar(): number | null {
    if (!this.chords || this.chords.length === 0) return null;

    const currentChord = this.chords.find(chord =>
      this.currentTime >= chord.start_time && this.currentTime < chord.end_time
    );

    return currentChord ? currentChord.bar : null;
  }

  // Métodos para el timeline de acordes
  public isCurrentChord(chord: ChordData): boolean {
    return this.currentTime >= chord.start_time && this.currentTime < chord.end_time;
  }

  public isActiveChord(chord: ChordData): boolean {
    return Math.abs(this.currentTime - chord.start_time) < 1; // Activo si está cerca
  }

  public isPastChord(chord: ChordData): boolean {
    return this.currentTime > chord.end_time;
  }

  public isFutureChord(chord: ChordData): boolean {
    return this.currentTime < chord.start_time;
  }

  public seekToChord(chord: ChordData): void {
    if (!this.wavesurfer || !this.duration) return;

    const percentage = (chord.start_time / this.duration);
    this.wavesurfer.seekTo(percentage);
  }

  private scrollToCurrentChord(currentChordIndex: number): void {
    if (!this.chordsTimelineContainer?.nativeElement || currentChordIndex === -1) {
      return;
    }

    const timelineContainer = this.chordsTimelineContainer.nativeElement;
    const chordElements = timelineContainer.querySelectorAll('.chord-item');

    if (chordElements?.[currentChordIndex]) {
      const currentChordElement = chordElements[currentChordIndex] as HTMLElement;
      const containerWidth = timelineContainer.clientWidth;
      const chordWidth = currentChordElement.offsetWidth;
      const chordLeft = currentChordElement.offsetLeft;

      // Posicionar ligeramente hacia la izquierda del centro para mostrar contexto
      const offset = containerWidth * 0.35; // 35% del ancho del contenedor desde la izquierda
      const idealScrollPosition = chordLeft - offset;

      // Asegurar que no se desplace fuera de los límites
      const maxScroll = timelineContainer.scrollWidth - containerWidth;
      const finalScrollPosition = Math.max(0, Math.min(idealScrollPosition, maxScroll));

      // Aplicar scroll suave solo si la diferencia es significativa
      const currentScroll = timelineContainer.scrollLeft;
      if (Math.abs(currentScroll - finalScrollPosition) > chordWidth) {
        timelineContainer.scrollTo({
          left: finalScrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }
}
