import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidepanel',
  imports: [],
  templateUrl: './sidepanel.component.html',
  styleUrl: './sidepanel.component.scss'
})
export class SidepanelComponent {
  @Input() isOpen: boolean = false;
  @Output() closeSidepanel = new EventEmitter<void>();

  onClose() {
    this.closeSidepanel.emit();
  }
}
