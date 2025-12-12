import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  public userName = '';

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  public redirectPage(type: string): void {
      this.router.navigate(['/input-method'], { queryParams: { type } });
  }

}
