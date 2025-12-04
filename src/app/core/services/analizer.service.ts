import { Injectable } from '@angular/core';
import { environment } from '../../../env/pre.env';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface AnalysisResult {
  key?: string;
  tempo_bpm?: number;
  chords?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalizerService {

  private readonly analysisDataSubject = new BehaviorSubject<AnalysisResult | null>(null);
  public analysisData$ = this.analysisDataSubject.asObservable();

  private readonly baseURL = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  public analyzeLink(url: string) {
    return this.http.post(`${this.baseURL}/api/analyze/analyze/link`, { youtube_url: url }).pipe(
     tap((response: any) => {
       console.log('AnalizerService analyzeLink response:', response);
     })
    );
  }

  public analizeFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseURL}/api/analizer/analyze-file`, formData);
  }

   public setAnalysisData(data: AnalysisResult): void {
    this.analysisDataSubject.next(data);
  }

  public getAnalysisData(): AnalysisResult | null {
    return this.analysisDataSubject.value;
  }

  public clearAnalysisData(): void {
    this.analysisDataSubject.next(null);
  }



}
