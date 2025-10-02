import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  test: string = '';

  private readonly baseUrl = 'http://192.168.1.177:8000';

  constructor(private readonly http: HttpClient) {}
  ngOnInit(): void {
    this.getMessage().subscribe(response => {
      this.test = response.message as string;
    });
  }
  getMessage(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }


}
