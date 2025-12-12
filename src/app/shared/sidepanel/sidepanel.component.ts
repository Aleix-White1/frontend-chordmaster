import { Component, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from '../../features/home/history/history.component';


@Component({
  selector: 'app-sidepanel',
  standalone: true,
  imports: [RouterModule, CommonModule, HistoryComponent],
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss']
})
export class SidepanelComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closeSidepanel = new EventEmitter<void>();
  @ViewChild(HistoryComponent) historyComponent!: HistoryComponent;

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando se abre el sidepanel, refrescar el historial
    if (changes['isOpen']?.currentValue && !changes['isOpen']?.previousValue) {
      console.log('📋 Sidepanel opened - refreshing history');
      // Usar setTimeout para asegurar que el ViewChild esté inicializado
      setTimeout(() => {
        if (this.historyComponent) {
          this.historyComponent.refreshHistory();
        }
      }, 100);
    }
  }

  onClose() {
    this.closeSidepanel.emit();
  }
}
