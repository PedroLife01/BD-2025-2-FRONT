/**
 * ============================================
 * SIGEA Frontend - Confirm Dialog Component
 * ============================================
 */

import { Component, inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container" [class]="data.type || 'info'">
      <div class="dialog-icon">
        @switch (data.type) {
          @case ('danger') {
            <mat-icon>warning</mat-icon>
          }
          @case ('warning') {
            <mat-icon>help_outline</mat-icon>
          }
          @default {
            <mat-icon>info</mat-icon>
          }
        }
      </div>
      
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button
          mat-flat-button
          [color]="data.type === 'danger' ? 'warn' : 'primary'"
          (click)="onConfirm()"
        >
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 8px;
      min-width: 300px;
    }

    .dialog-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 8px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }

    .info .dialog-icon mat-icon {
      color: #1976d2;
    }

    .warning .dialog-icon mat-icon {
      color: #ff9800;
    }

    .danger .dialog-icon mat-icon {
      color: #f44336;
    }

    h2 {
      text-align: center;
      margin-bottom: 8px;
    }

    mat-dialog-content p {
      text-align: center;
      color: #666;
    }

    mat-dialog-actions {
      padding-top: 16px;
    }
  `]
})
export class ConfirmDialogComponent {
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
