import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { SidepanelComponent } from '../sidepanel/sidepanel.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SidepanelComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public currentUser: string | null = null;
  public isSidepanelOpen: boolean = false;
  private readonly subscription: Subscription = new Subscription();

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {
    this.authService.getUserData().then(userData => {
      this.currentUser = userData.name ?? null;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onLogOut() {
    this.authService.logout();
  }

  openSidePanel() {
    this.isSidepanelOpen = true;
  }

  closeSidePanel() {
    this.isSidepanelOpen = false;
  }
  goBack() {
    window.history.back();
  }

}
