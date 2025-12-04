import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalizerService } from '../../../core/services/analizer.service';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {NgxSpinnerModule, NgxSpinnerService}  from "ngx-spinner";

@Component({
  selector: 'app-input-method',
  imports: [HeaderComponent, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './input-method.component.html',
  styleUrl: './input-method.component.scss'
})
export class InputMethodComponent implements OnInit, OnDestroy {

  public inputType: string = '';
  public selectedFileName: string = '';
  public youtubeLink: FormControl = new FormControl('');
  private readonly subscription: Subscription = new Subscription();

  constructor(private readonly route: ActivatedRoute, private readonly analizerService: AnalizerService, private readonly spinner: NgxSpinnerService, private readonly router: Router) {}

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

  public sendToAnalize(): void {
    this.spinner.show();
    const url = this.youtubeLink.value;
    console.log('Sending URL to analize:', url);
    this.analizerService.analyzeLink(url as string).subscribe({
      next: (response) => {
        this.analizerService.setAnalysisData({
        key: response.analysis.key,
        tempo_bpm: response.analysis.tempo_bpm,
        chords: response.analysis.chords
      });
        this.spinner.hide();
        this.router.navigate(['/analizer']);
      },
      error: (error) => {
        console.error('Analysis error:', error);
        this.spinner.hide();
      }
    });
  }
}
