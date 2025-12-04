/**
 * ============================================
 * SIGEA Frontend - Loading Component
 * ============================================
 */

import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay()">
      <mat-spinner [diameter]="diameter()"></mat-spinner>
      @if (message()) {
        <p class="loading-message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;

      &.overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.8);
        z-index: 9999;
      }
    }

    .loading-message {
      color: #666;
      font-size: 14px;
    }
  `]
})
export class LoadingComponent {
  diameter = input(40);
  message = input<string>('');
  overlay = input(false);
}
