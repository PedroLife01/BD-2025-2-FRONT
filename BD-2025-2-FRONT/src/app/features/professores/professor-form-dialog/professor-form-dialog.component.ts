/**
 * ============================================
 * SIGEA Frontend - Professor Form Dialog Component
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
import { MatSelectModule } from '@angular/material/select';

import { ProfessorService, EscolaService } from '../../../core/services';
import { Professor, Escola } from '../../../core/models';

@Component({
  selector: 'app-professor-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'person_add' }}</mat-icon>
      {{ isEditing ? 'Editar Professor' : 'Novo Professor' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome Completo</mat-label>
          <input matInput formControlName="nome" placeholder="Nome do professor">
          @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

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
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #7b1fa2; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; padding-top: 16px; }
    .full-width { grid-column: 1 / -1; }
    mat-dialog-content { min-width: 500px; }
  `]
})
export class ProfessorFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ProfessorFormDialogComponent>);
  private professorService = inject(ProfessorService);
  private escolaService = inject(EscolaService);
  private fb = inject(FormBuilder);
  data = inject<Professor | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  escolas = signal<Escola[]>([]);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.loadEscolas();
    
    this.form = this.fb.group({
      nome: [this.data?.nome || '', Validators.required],
      idEscola: [this.data?.idEscola || '', Validators.required],
      email: [this.data?.email || '', Validators.email],
      telefone: [this.data?.telefone || ''],
    });
  }

  loadEscolas(): void {
    this.escolaService.findAll({ limit: 100 }).subscribe({
      next: (res: { data: Escola[] }) => this.escolas.set(res.data),
      error: (err: Error) => console.error('Erro ao carregar escolas:', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const formData = {
      nome: this.form.value.nome,
      idEscola: this.form.value.idEscola,
      email: this.form.value.email || null,
      telefone: this.form.value.telefone || null,
    };

    const request$ = this.isEditing
      ? this.professorService.update(this.data!.id, formData)
      : this.professorService.create(formData);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
