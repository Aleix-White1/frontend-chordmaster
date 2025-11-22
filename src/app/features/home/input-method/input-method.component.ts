import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/header/header.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-input-method',
  imports: [HeaderComponent],
  templateUrl: './input-method.component.html',
  styleUrl: './input-method.component.scss'
})
export class InputMethodComponent implements OnInit, OnDestroy {
  public inputType: string = '';
  public selectedFileName: string = '';
  private readonly subscription: Subscription = new Subscription();

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        this.inputType = params['type'] || '';
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public setInputType(type: string): void {

    this.inputType = type;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
    }
  }
}
