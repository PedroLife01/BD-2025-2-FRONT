/**
 * ============================================
 * SIGEA Frontend - Período Form Dialog Component
 * ============================================
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { PeriodoLetivoService } from '../../../core/services';
import { PeriodoLetivo } from '../../../core/models';

@Component({
  selector: 'app-periodo-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'date_range' }}</mat-icon>
      {{ isEditing ? 'Editar Período' : 'Novo Período' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Ano</mat-label>
          <input matInput type="number" formControlName="ano" placeholder="Ex: 2025">
          @if (form.get('ano')?.hasError('required') && form.get('ano')?.touched) {
            <mat-error>Ano é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Etapa</mat-label>
          <mat-select formControlName="etapa">
            <mat-option value="1º Bimestre">1º Bimestre</mat-option>
            <mat-option value="2º Bimestre">2º Bimestre</mat-option>
            <mat-option value="3º Bimestre">3º Bimestre</mat-option>
            <mat-option value="4º Bimestre">4º Bimestre</mat-option>
            <mat-option value="1º Trimestre">1º Trimestre</mat-option>
            <mat-option value="2º Trimestre">2º Trimestre</mat-option>
            <mat-option value="3º Trimestre">3º Trimestre</mat-option>
            <mat-option value="1º Semestre">1º Semestre</mat-option>
            <mat-option value="2º Semestre">2º Semestre</mat-option>
          </mat-select>
          @if (form.get('etapa')?.hasError('required') && form.get('etapa')?.touched) {
            <mat-error>Etapa é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Data Início</mat-label>
          <input matInput [matDatepicker]="pickerInicio" formControlName="dataInicio">
          <mat-datepicker-toggle matIconSuffix [for]="pickerInicio"></mat-datepicker-toggle>
          <mat-datepicker #pickerInicio></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Data Fim</mat-label>
          <input matInput [matDatepicker]="pickerFim" formControlName="dataFim">
          <mat-datepicker-toggle matIconSuffix [for]="pickerFim"></mat-datepicker-toggle>
          <mat-datepicker #pickerFim></mat-datepicker>
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
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #5c6bc0; } }
    .form-column { display: flex; flex-direction: column; padding-top: 16px; }
    mat-dialog-content { min-width: 400px; }
  `]
})
export class PeriodoFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<PeriodoFormDialogComponent>);
  private periodoService = inject(PeriodoLetivoService);
  private fb = inject(FormBuilder);
  data = inject<PeriodoLetivo | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      ano: [this.data?.ano || new Date().getFullYear(), Validators.required],
      etapa: [this.data?.etapa || '', Validators.required],
      dataInicio: [this.data?.dataInicio ? new Date(this.data.dataInicio) : null],
      dataFim: [this.data?.dataFim ? new Date(this.data.dataFim) : null],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const formData: any = {
      ano: parseInt(this.form.value.ano),
      etapa: this.form.value.etapa,
      dataInicio: this.form.value.dataInicio 
        ? this.form.value.dataInicio.toISOString().split('T')[0] 
        : null,
      dataFim: this.form.value.dataFim 
        ? this.form.value.dataFim.toISOString().split('T')[0] 
        : null,
    };

    const request$ = this.isEditing
      ? this.periodoService.update(this.data!.id, formData)
      : this.periodoService.create(formData);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
