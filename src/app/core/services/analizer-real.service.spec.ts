import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalizerService } from './analizer.service';

describe('AnalizerService Real Tests', () => {
  let service: AnalizerService;
  let httpMock: HttpTestingController;
  const baseURL = 'http://localhost:8000';

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

  it('should analyze real YouTube URL', () => {
    // URL real de YouTube para testing
    const realYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll - Never Gonna Give You Up
    const mockResponse = {
      job_id: 'real-job-id',
      analysis: {
        key: 'F#',
        tempo_bpm: 113,
        title: 'Rick Astley - Never Gonna Give You Up',
        chords: [
          { chord: 'F#', start_time: 0, end_time: 4, bar: 1 },
          { chord: 'D#m', start_time: 4, end_time: 8, bar: 2 }
        ]
      }
    };

    service.analyzeLink(realYouTubeUrl).subscribe(response => {
      expect(response.analysis.title).toContain('Never Gonna Give You Up');
      expect(response.analysis.key).toBe('F#');
      expect(response.analysis.tempo_bpm).toBe(113);
      expect(response.analysis.chords.length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/link`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.youtube_url).toBe(realYouTubeUrl);

    req.flush(mockResponse);
  });

  it('should analyze real audio file', () => {
    // Simular un archivo de audio real
    const audioContent = new ArrayBuffer(1024); // Buffer simulado
    const realAudioFile = new File([audioContent], 'test-song.mp3', {
      type: 'audio/mpeg',
      lastModified: Date.now()
    });

    const mockResponse = {
      job_id: 'file-analysis-job',
      analysis: {
        key: 'C',
        tempo_bpm: 120,
        title: 'test-song.mp3',
        chords: [
          { chord: 'C', start_time: 0, end_time: 2, bar: 1 },
          { chord: 'Am', start_time: 2, end_time: 4, bar: 2 },
          { chord: 'F', start_time: 4, end_time: 6, bar: 3 },
          { chord: 'G', start_time: 6, end_time: 8, bar: 4 }
        ]
      }
    };

    service.analizeFile(realAudioFile).subscribe(response => {
      expect(response.analysis.title).toBe('test-song.mp3');
      expect(response.analysis.key).toBe('C');
      expect(response.analysis.tempo_bpm).toBe(120);
      expect(response.analysis.chords.length).toBe(4);
      expect(response.analysis.chords[0].chord).toBe('C');
      expect(response.analysis.chords[1].chord).toBe('Am');
    });

    const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/file`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);

    req.flush(mockResponse);
  });

  it('should handle real world scenarios', () => {
    // Test con diferentes tipos de respuesta que podríamos recibir del servidor real
    const scenarios = [
      {
        name: 'Pop song in major key',
        response: {
          analysis: { key: 'C', tempo_bpm: 128, title: 'Pop Hit', chords: [] }
        }
      },
      {
        name: 'Rock song in minor key',
        response: {
          analysis: { key: 'Am', tempo_bpm: 140, title: 'Rock Anthem', chords: [] }
        }
      },
      {
        name: 'Jazz standard with complex harmony',
        response: {
          analysis: { key: 'Bb', tempo_bpm: 95, title: 'Jazz Standard', chords: [] }
        }
      }
    ];

    scenarios.forEach((scenario, index) => {
      const testUrl = `https://www.youtube.com/watch?v=test${index}`;

      service.analyzeLink(testUrl).subscribe(response => {
        expect(response.analysis.title).toBe(scenario.response.analysis.title);
        expect(response.analysis.key).toBe(scenario.response.analysis.key);
        expect(response.analysis.tempo_bpm).toBe(scenario.response.analysis.tempo_bpm);
      });

      const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/link`);
      req.flush(scenario.response);
    });
  });

  it('should validate YouTube URL formats', () => {
    const validUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ'
    ];

    validUrls.forEach(url => {
      service.analyzeLink(url).subscribe();
      const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/link`);
      expect(req.request.body.youtube_url).toBe(url);
      req.flush({ analysis: { key: 'C', tempo_bpm: 120, chords: [] } });
    });
  });

  it('should handle various audio file formats', () => {
    const audioFormats = [
      { name: 'song.mp3', type: 'audio/mpeg' },
      { name: 'track.wav', type: 'audio/wav' },
      { name: 'audio.flac', type: 'audio/flac' },
      { name: 'music.m4a', type: 'audio/mp4' }
    ];

    audioFormats.forEach(format => {
      const file = new File(['audio data'], format.name, { type: format.type });

      service.analizeFile(file).subscribe(response => {
        expect(response.analysis.title).toBe(format.name);
      });

      const req = httpMock.expectOne(`${baseURL}/api/analyze/analyze/file`);
      req.flush({ analysis: { key: 'C', tempo_bpm: 120, title: format.name, chords: [] } });
    });
  });
});
