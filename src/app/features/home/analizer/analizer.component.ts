import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AnalizerService } from '../../../core/services/analizer.service';

@Component({
  selector: 'app-analizer',
  imports: [HeaderComponent],
  templateUrl: './analizer.component.html',
  styleUrls: ['./analizer.component.scss'],
})
export class AnalizerComponent implements OnInit {

  public tone : string = '';
  public tempo : number | undefined;


  constructor(private readonly analysisDataService: AnalizerService) {}

  ngOnInit(): void {
    this.analysisDataService.analysisData$.subscribe((data) => {
      if (data) {
        this.tone = data.key || 'Unknown';
        this.tempo = Math.round(data.tempo_bpm || 0);

      }
      else {
        console.log('No analysis data available.');
      }
    });
  }
}
