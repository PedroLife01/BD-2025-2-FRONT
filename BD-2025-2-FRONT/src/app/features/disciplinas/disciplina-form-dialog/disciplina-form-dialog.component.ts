/**
 * ============================================
 * SIGEA Frontend - Disciplina Form Dialog Component
 * ============================================
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DisciplinaService } from '../../../core/services';
import { Disciplina } from '../../../core/models';

@Component({
  selector: 'app-disciplina-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'menu_book' }}</mat-icon>
      {{ isEditing ? 'Editar Disciplina' : 'Nova Disciplina' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Nome da Disciplina</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Matemática">
          @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Carga Horária (horas)</mat-label>
          <input matInput type="number" formControlName="cargaHoraria" placeholder="60">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Área de Conhecimento</mat-label>
          <input matInput formControlName="areaConhecimento" placeholder="Ex: Ciências Exatas">
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="loading() || form.invalid">
        @if (loading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditing ? 'Salvar' : 'Criar' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #ff9800; } }
    .form-column { display: flex; flex-direction: column; padding-top: 16px; }
    mat-dialog-content { min-width: 400px; }
  `]
})
export class DisciplinaFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DisciplinaFormDialogComponent>);
  private disciplinaService = inject(DisciplinaService);
  private fb = inject(FormBuilder);
  data = inject<Disciplina | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: [this.data?.nome || '', Validators.required],
      cargaHoraria: [this.data?.cargaHoraria || null],
      areaConhecimento: [this.data?.areaConhecimento || ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const formData: any = {
      nome: this.form.value.nome,
      cargaHoraria: this.form.value.cargaHoraria || null,
      areaConhecimento: this.form.value.areaConhecimento || null,
    };

    const request$ = this.isEditing
      ? this.disciplinaService.update(this.data!.id, formData)
      : this.disciplinaService.create(formData);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
