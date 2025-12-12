import { Injectable } from '@angular/core';
import { environment } from '../../../env/pre.env';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';

export interface ChordData {
  chord: string;
  start_time: number;
  end_time: number;
  bar: number;
  prevChord: string | null;
  nextChord: string | null;
  confidence?: number;
}

export interface AnalysisResult {
  key?: string;
  tempo_bpm?: number;
  chords?: ChordData[];
  title?: string;
  job_id?: string;
}

export interface HistoryItem {
  song_id: string;
  user_id: number;
  title: string;
  source: string;
  youtube_url?: string;
  tempo_bpm: number;
  key: string;
  beats_per_bar: number;
  chords: ChordData[];
  analyzed_at: string;
  job_id?: string; // Mantener compatibilidad
}

@Injectable({
  providedIn: 'root'
})
export class AnalizerService {

  private readonly analysisDataSubject = new BehaviorSubject<AnalysisResult | null>(null);
  public analysisData$ = this.analysisDataSubject.asObservable();

  private readonly baseURL = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  public analyzeLink(url: string): Observable<any> {
    return this.http.post(`${this.baseURL}/api/analyze/analyze/link`, { youtube_url: url }).pipe(
      tap((response: any) => {
        console.log('AnalizerService analyzeLink response:', response);
      }),
      catchError((error: any) => {
        console.error('AnalizerService analyzeLink error:', error);
        console.error('Request URL:', `${this.baseURL}/api/analyze/analyze/link`);
        console.error('Request body:', { youtube_url: url });
        throw error;
      })
    );
  }

  // Análisis de archivos
  public analizeFile(file: File): Observable<any> {
    console.log('AnalizerService analyzing file:', file.name);
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseURL}/api/analyze/analyze/file`, formData).pipe(
      tap((response: any) => {
        console.log('AnalizerService analizeFile response:', response);
      }),
      catchError((error: any) => {
        console.error('AnalizerService analizeFile error:', error);
        throw error;
      })
    );
  }

  // Gestión de datos de análisis
  public setAnalysisData(data: AnalysisResult): void {
    console.log('AnalizerService setting analysis data:', data);
    this.analysisDataSubject.next(data);
  }

  public getAnalysisData(): AnalysisResult | null {
    return this.analysisDataSubject.value;
  }

  public clearAnalysisData(): void {
    this.analysisDataSubject.next(null);
  }

  // Gestión del historial
  public getHistory(): Observable<any> {
    console.log('🔍 AnalizerService: Making GET request to:', `${this.baseURL}/api/analyze/history`);
    return this.http.get(`${this.baseURL}/api/analyze/history`).pipe(
      tap((response: any) => {
        console.log('✅ AnalizerService getHistory response:', response);
        console.log('📊 Response type:', typeof response);
        console.log('🔢 History items count:', Array.isArray(response) ? response.length : (response?.history?.length || 'unknown'));
      }),
      catchError((error: any) => {
        console.error('❌ AnalizerService getHistory error:', error);
        console.error('🔍 Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        throw error;
      })
    );
  }

  public deleteHistoryItem(songId: string): Observable<any> {
    return this.http.delete(`${this.baseURL}/api/analyze/history/${songId}`).pipe(
      tap((response: any) => {
        console.log('AnalizerService deleteHistoryItem response:', response);
      }),
      catchError((error: any) => {
        console.error('AnalizerService deleteHistoryItem error:', error);
        throw error;
      })
    );
  }

  public getHistoryItem(songId: string): Observable<any> {
    return this.http.get(`${this.baseURL}/api/analyze/history/${songId}`).pipe(
      tap((response: any) => {
        console.log('AnalizerService getHistoryItem response:', response);
      }),
      catchError((error: any) => {
        console.error('AnalizerService getHistoryItem error:', error);
        throw error;
      })
    );
  }
}
