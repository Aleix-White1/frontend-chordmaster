import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AnalizerService, HistoryItem } from '../../../core/services/analizer.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
  public historyItems: HistoryItem[] = [];
  public isLoading: boolean = false;
  public errorMessage: string = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly analizerService: AnalizerService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  // Método público para refrescar el historial desde componentes externos
  public refreshHistory(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('📋 Loading history...');

    this.analizerService
      .getHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('✅ History loaded successfully:', response);
          this.historyItems = response.history || response || []; // Manejar diferentes formatos de respuesta
          console.log('📊 History items:', this.historyItems.length, 'items');
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('❌ Error loading history:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.errorMessage = 'Error al cargar el historial';
          this.isLoading = false;
        },
      });
  }

  public loadSong(item: HistoryItem): void {
    console.log('🎵 Loading song from history:', item);
    console.log('🎵 Raw chords in loadSong:', {
      chords: item.chords,
      type: typeof item.chords,
      isArray: Array.isArray(item.chords)
    });

    // Asegurar que los acordes son un array válido
    let chords = item.chords;
    if (typeof chords === 'string') {
      try {
        console.log('🔄 Parsing chords from string in history...');
        chords = JSON.parse(chords);
        console.log('✅ Chords parsed in history:', chords);
      } catch (error) {
        console.error('❌ Error parsing chords in history:', error);
        chords = [];
      }
    }

    // Establecer los datos de análisis en el servicio
    this.analizerService.setAnalysisData({
      key: item.key,
      tempo_bpm: item.tempo_bpm,
      chords: chords,
      title: item.title,
      job_id: item.job_id || item.song_id, // Usar job_id si existe, si no song_id
    });

    // Navegar al componente de análisis
    this.router.navigate(['/analizer']);
  }

  public deleteItem(item: HistoryItem, event: Event): void {
    event.stopPropagation();

    console.log('🗑️ Attempting to delete item:', item);
    console.log('📋 Item properties:', {
      id: (item as any).id,
      song_id: item.song_id,
      job_id: item.job_id,
      title: item.title,
      allProperties: Object.keys(item)
    });

    // Intentar primero con el ID numérico, luego job_id
    const itemId = (item as any).id || item.job_id || item.song_id;
    console.log('🔍 Selected ID for deletion (trying numeric id first):', {
      selectedId: itemId,
      type: typeof itemId,
      numericId: (item as any).id,
      jobId: item.job_id,
      songId: item.song_id
    });

    if (!itemId) {
      console.error('❌ No valid ID found for item:', item);
      Swal.fire({
        title: 'Error',
        text: 'No se puede eliminar el elemento, ID no válido',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#675a4f', // stone-brown
        background: '#e7e0d0', // fossil
        color: '#675a4f', // stone-brown
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-error'
        }
      });
      return;
    }

    // Mostrar diálogo de confirmación con SweetAlert2
    Swal.fire({
      title: '¿Eliminar canción?',
      html: `¿Estás seguro de que quieres eliminar<br><strong>"${item.title}"</strong><br>del historial?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#675a4f', // stone-brown
      cancelButtonColor: '#bda897', // cost-wold
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      background: '#e7e0d0', // fossil
      color: '#675a4f', // stone-brown
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('🚀 Deleting with ID:', itemId);

        this.analizerService
          .deleteHistoryItem(itemId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log('✅ Item deleted successfully');
              this.historyItems = this.historyItems.filter((h) =>
                ((h as any).id || h.job_id || h.song_id) !== itemId
              );

              // Mostrar confirmación de eliminación exitosa
              Swal.fire({
                title: '¡Eliminado!',
                text: 'La canción ha sido eliminada del historial',
                icon: 'success',
                confirmButtonText: 'Perfecto',
                confirmButtonColor: '#bda897', // cost-wold
                timer: 2000,
                timerProgressBar: true,
                background: '#e7e0d0', // fossil
                color: '#675a4f', // stone-brown
                customClass: {
                  popup: 'custom-swal-popup',
                  confirmButton: 'custom-swal-success'
                }
              });
            },
            error: (error: any) => {
              console.error('❌ Error deleting history item:', error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la canción del historial',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#675a4f', // stone-brown
                background: '#e7e0d0', // fossil
                color: '#675a4f', // stone-brown
                customClass: {
                  popup: 'custom-swal-popup',
                  confirmButton: 'custom-swal-error'
                }
              });
            },
          });
      }
    });
  }

  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  public trackByFn(index: number, item: HistoryItem): string {
    return (item as any).id?.toString() || item.job_id || item.song_id || index.toString();
  }
}
