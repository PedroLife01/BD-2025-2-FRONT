/**
 * ============================================
 * SIGEA Frontend - Turma Form Dialog Component
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

import { TurmaService, EscolaService } from '../../../core/services';
import { Turma, Escola } from '../../../core/models';

@Component({
  selector: 'app-turma-form-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'group_add' }}</mat-icon>
      {{ isEditing ? 'Editar Turma' : 'Nova Turma' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Escola</mat-label>
          <mat-select formControlName="idEscola">
            @for (escola of escolas(); track escola.id) {
              <mat-option [value]="escola.id">{{ escola.nome }}</mat-option>
            }
          </mat-select>
          @if (form.get('idEscola')?.hasError('required') && form.get('idEscola')?.touched) {
            <mat-error>Escola é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nome da Turma</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Turma A">
          @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ano Letivo</mat-label>
          <input matInput type="number" formControlName="anoLetivo" placeholder="2025">
          @if (form.get('anoLetivo')?.hasError('required') && form.get('anoLetivo')?.touched) {
            <mat-error>Ano letivo é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Série</mat-label>
          <input matInput formControlName="serie" placeholder="Ex: 6º Ano">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Turno</mat-label>
          <mat-select formControlName="turno">
            <mat-option value="Matutino">Matutino</mat-option>
            <mat-option value="Vespertino">Vespertino</mat-option>
            <mat-option value="Noturno">Noturno</mat-option>
            <mat-option value="Integral">Integral</mat-option>
          </mat-select>
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
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #388e3c; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; padding-top: 16px; }
    .full-width { grid-column: 1 / -1; }
    mat-dialog-content { min-width: 400px; }
  `]
})
export class TurmaFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<TurmaFormDialogComponent>);
  private turmaService = inject(TurmaService);
  private escolaService = inject(EscolaService);
  private fb = inject(FormBuilder);
  data = inject<Turma | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  escolas = signal<Escola[]>([]);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      idEscola: [this.data?.idEscola || '', Validators.required],
      nome: [this.data?.nome || '', Validators.required],
      anoLetivo: [this.data?.anoLetivo || new Date().getFullYear(), Validators.required],
      serie: [this.data?.serie || ''],
      turno: [this.data?.turno || ''],
    });
    this.loadEscolas();
  }

  loadEscolas(): void {
    this.escolaService.findAll({ limit: 100 }).subscribe({
      next: (res) => this.escolas.set(res.data)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const request$ = this.isEditing
      ? this.turmaService.update(this.data!.id, this.form.value)
      : this.turmaService.create(this.form.value);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
