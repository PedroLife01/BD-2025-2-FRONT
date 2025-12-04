/**
 * ============================================
 * SIGEA Frontend - Empty State Component
 * ============================================
 */

import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button color="primary" (click)="action.emit()">
          <mat-icon>add</mat-icon>
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 20px;
      font-weight: 500;
      color: #333;
      margin: 0 0 8px;
    }

    p {
      color: #666;
      margin: 0 0 24px;
      max-width: 400px;
    }

    button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class EmptyStateComponent {
  icon = input('inbox');
  title = input('Nenhum registro encontrado');
  message = input('Não há dados para exibir no momento.');
  actionLabel = input<string>('');
  action = output<void>();
}
