/**
 * ============================================
 * SIGEA Frontend - Coordenador Form Dialog Component
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

import { CoordenadorService, EscolaService } from '../../../core/services';
import { Coordenador, Escola } from '../../../core/models';

@Component({
  selector: 'app-coordenador-form-dialog',
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
      <mat-icon>{{ isEditing ? 'edit' : 'supervisor_account' }}</mat-icon>
      {{ isEditing ? 'Editar Coordenador' : 'Novo Coordenador' }}
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

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome Completo</mat-label>
          <input matInput formControlName="nome" placeholder="Nome do coordenador">
          @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="email@exemplo.com">
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Email inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="telefone" placeholder="(00) 00000-0000">
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
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #00796b; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; padding-top: 16px; }
    .full-width { grid-column: 1 / -1; }
    mat-dialog-content { min-width: 500px; }
  `]
})
export class CoordenadorFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CoordenadorFormDialogComponent>);
  private coordenadorService = inject(CoordenadorService);
  private escolaService = inject(EscolaService);
  private fb = inject(FormBuilder);
  data = inject<Coordenador | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  escolas = signal<Escola[]>([]);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      idEscola: [this.data?.idEscola || '', Validators.required],
      nome: [this.data?.nome || '', Validators.required],
      email: [this.data?.email || '', Validators.email],
      telefone: [this.data?.telefone || ''],
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

    const formData = {
      idEscola: this.form.value.idEscola,
      nome: this.form.value.nome,
      email: this.form.value.email || null,
      telefone: this.form.value.telefone || null,
    };

    const request$ = this.isEditing
      ? this.coordenadorService.update(this.data!.id, formData)
      : this.coordenadorService.create(formData);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
