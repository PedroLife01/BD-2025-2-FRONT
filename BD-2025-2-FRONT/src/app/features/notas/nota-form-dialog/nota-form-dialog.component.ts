/**
 * ============================================
 * SIGEA Frontend - Nota Form Dialog Component
 * ============================================
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NotaService, AvaliacaoService, AlunoService } from '../../../core/services';
import { Nota, Avaliacao, Aluno } from '../../../core/models';

@Component({
  selector: 'app-nota-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
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
      <mat-icon>{{ isEditing ? 'edit' : 'grade' }}</mat-icon>
      {{ isEditing ? 'Editar Nota' : 'Lançar Nota' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Avaliação</mat-label>
          <mat-select formControlName="idAvaliacao">
            @for (avaliacao of avaliacoes(); track avaliacao.id) {
              <mat-option [value]="avaliacao.id">
                {{ avaliacao.titulo }} (Peso: {{ avaliacao.peso }})
              </mat-option>
            }
          </mat-select>
          @if (form.get('idAvaliacao')?.hasError('required') && form.get('idAvaliacao')?.touched) {
            <mat-error>Avaliação é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Aluno</mat-label>
          <mat-select formControlName="idAluno">
            @for (aluno of alunos(); track aluno.id) {
              <mat-option [value]="aluno.id">
                {{ aluno.matricula }} - {{ aluno.nome }}
              </mat-option>
            }
          </mat-select>
          @if (form.get('idAluno')?.hasError('required') && form.get('idAluno')?.touched) {
            <mat-error>Aluno é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nota Obtida</mat-label>
          <input matInput type="number" formControlName="notaObtida" placeholder="0.0" step="0.1" min="0" max="10">
          @if (form.get('notaObtida')?.hasError('required') && form.get('notaObtida')?.touched) {
            <mat-error>Nota é obrigatória</mat-error>
          }
          @if (form.get('notaObtida')?.hasError('min')) {
            <mat-error>Nota deve ser maior ou igual a 0</mat-error>
          }
          @if (form.get('notaObtida')?.hasError('max')) {
            <mat-error>Nota deve ser menor ou igual a 10</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="loading() || form.invalid">
        @if (loading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditing ? 'Salvar' : 'Lançar' }}
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
export class NotaFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<NotaFormDialogComponent>);
  private notaService = inject(NotaService);
  private avaliacaoService = inject(AvaliacaoService);
  private alunoService = inject(AlunoService);
  private fb = inject(FormBuilder);
  data = inject<Nota | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  avaliacoes = signal<Avaliacao[]>([]);
  alunos = signal<Aluno[]>([]);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      idAvaliacao: [this.data?.idAvaliacao || '', Validators.required],
      idAluno: [this.data?.idAluno || '', Validators.required],
      notaObtida: [this.data?.notaObtida || '', [Validators.required, Validators.min(0), Validators.max(10)]],
    });
    this.loadSelects();
  }

  loadSelects(): void {
    this.avaliacaoService.findAll({ limit: 100 }).subscribe({
      next: (res) => this.avaliacoes.set(res.data)
    });
    this.alunoService.findAll({ limit: 100 }).subscribe({
      next: (res) => this.alunos.set(res.data)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const formData: any = {
      idAvaliacao: this.form.value.idAvaliacao,
      idAluno: this.form.value.idAluno,
      notaObtida: parseFloat(this.form.value.notaObtida),
    };

    const request$ = this.isEditing
      ? this.notaService.update(this.data!.id, formData)
      : this.notaService.create(formData);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
