import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalizerService, AnalysisResult, ChordData, HistoryItem } from './analizer.service';
import { environment } from '../../../env/pre.env';

describe('AnalizerService', () => {
  let service: AnalizerService;
  let httpMock: HttpTestingController;
  const baseURL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalizerService]
    });
    service = TestBed.inject(AnalizerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('analyzeLink', () => {
    it('should send POST request with YouTube URL', () => {
      const testUrl = 'https://www.youtube.com/watch?v=test';
      const expectedResponse = {
        job_id: 'test-job-id',
        analysis: {
          key: 'C',
          tempo_bpm: 120,
          chords: []
        },
        title: 'Test Video'
      };

      service.analyzeLink(testUrl).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/link`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ youtube_url: testUrl });
      req.flush(expectedResponse);
    });

    it('should handle error when analyzing link', () => {
      const testUrl = 'https://www.youtube.com/watch?v=test';
      const errorMessage = 'Network error';

      service.analyzeLink(testUrl).subscribe({
        next: () => fail('should have failed with network error'),
        error: (error) => {
          expect(error.message).toContain('Http failure response');
        }
      });

      const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/link`);
      req.error(new ErrorEvent(errorMessage));
    });
  });

  describe('analizeFile', () => {
    it('should send POST request with file', () => {
      const testFile = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
      const expectedResponse = {
        job_id: 'test-job-id',
        analysis: {
          key: 'D',
          tempo_bpm: 140,
          chords: []
        }
      };

      service.analizeFile(testFile).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/file`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      req.flush(expectedResponse);
    });
  });

  describe('analysisData management', () => {
    it('should set and get analysis data', () => {
      const testData: AnalysisResult = {
        key: 'F#',
        tempo_bpm: 136,
        chords: [
          {
            chord: 'F#maj7',
            start_time: 4.25,
            end_time: 6.01,
            bar: 1,
            prevChord: null,
            nextChord: 'F#maj7'
          }
        ],
        title: 'Test Song',
        job_id: 'test-job'
      };

      service.setAnalysisData(testData);

      expect(service.getAnalysisData()).toEqual(testData);
    });

    it('should emit analysis data through observable', (done) => {
      const testData: AnalysisResult = {
        key: 'G',
        tempo_bpm: 120,
        title: 'Observable Test'
      };

      service.analysisData$.subscribe(data => {
        if (data) {
          expect(data).toEqual(testData);
          done();
        }
      });

      service.setAnalysisData(testData);
    });

    it('should clear analysis data', () => {
      const testData: AnalysisResult = { key: 'A', tempo_bpm: 100 };

      service.setAnalysisData(testData);
      expect(service.getAnalysisData()).toEqual(testData);

      service.clearAnalysisData();
      expect(service.getAnalysisData()).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('should get history data', () => {
      const expectedHistory: HistoryItem[] = [
        {
          id: 1,
          user_id: 123,
          title: 'Test Song 1',
          source: 'youtube',
          tempo_bpm: 120,
          key: 'C',
          beats_per_bar: 4,
          chords: [],
          analyzed_at: '2025-12-12T10:00:00Z'
        }
      ];

      service.getHistory().subscribe(response => {
        expect(response.history || response).toEqual(expectedHistory);
      });

      const req = httpMock.expectOne(`${baseURL}/api/analyze/history`);
      expect(req.request.method).toBe('GET');
      req.flush({ history: expectedHistory });
    });
  });

  describe('deleteHistoryItem', () => {
    it('should delete history item by ID', () => {
      const songId = 'test-song-id';

      service.deleteHistoryItem(songId).subscribe();

      const req = httpMock.expectOne(`${baseURL}/api/analyze/history/${songId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('getHistoryItem', () => {
    it('should get specific history item', () => {
      const songId = 'test-song-id';
      const expectedItem: HistoryItem = {
        id: 1,
        user_id: 123,
        title: 'Specific Song',
        source: 'file',
        tempo_bpm: 140,
        key: 'F#',
        beats_per_bar: 4,
        chords: [],
        analyzed_at: '2025-12-12T10:00:00Z'
      };

      service.getHistoryItem(songId).subscribe(response => {
        expect(response).toEqual(expectedItem);
      });

      const req = httpMock.expectOne(`${baseURL}/api/analyze/history/${songId}`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedItem);
    });
  });
});
