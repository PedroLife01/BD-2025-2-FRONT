/**
 * ============================================
 * SIGEA Frontend - Page Header Component
 * ============================================
 */

import { Component, input, output, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          @if (icon()) {
            <mat-icon class="header-icon">{{ icon() }}</mat-icon>
          }
          <div class="titles">
            <h1>{{ title() }}</h1>
            @if (subtitle()) {
              <p>{{ subtitle() }}</p>
            }
          </div>
        </div>
        
        <div class="actions">
          @if (showButton()) {
            <button mat-flat-button color="primary" (click)="onActionClick()">
              <mat-icon>{{ buttonIcon() }}</mat-icon>
              {{ buttonLabel() }}
            </button>
          }
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #1976d2;
    }

    .titles h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: #1a1a1a;
    }

    .titles p {
      font-size: 14px;
      color: #666;
      margin: 4px 0 0;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    button mat-icon {
      margin-right: 4px;
    }

    @media (max-width: 600px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  icon = input<string>('');
  
  // Legacy API
  showAddButton = input(false);
  addButtonLabel = input('Adicionar');
  addClick = output<void>();
  
  // New API
  actionLabel = input<string>('');
  actionIcon = input<string>('add');
  action = output<void>();
  
  // Computed values for compatibility
  showButton = computed(() => this.showAddButton() || !!this.actionLabel());
  buttonLabel = computed(() => this.actionLabel() || this.addButtonLabel());
  buttonIcon = computed(() => this.actionIcon() || 'add');
  
  onActionClick(): void {
    this.addClick.emit();
    this.action.emit();
  }
}
