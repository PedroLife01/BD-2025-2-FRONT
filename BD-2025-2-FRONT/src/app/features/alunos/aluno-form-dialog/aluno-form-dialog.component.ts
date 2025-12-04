/**
 * ============================================
 * SIGEA Frontend - Aluno Form Dialog Component
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AlunoService, TurmaService } from '../../../core/services';
import { Aluno, Turma } from '../../../core/models';

@Component({
  selector: 'app-aluno-form-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'person_add' }}</mat-icon>
      {{ isEditing ? 'Editar Aluno' : 'Novo Aluno' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Turma</mat-label>
          <mat-select formControlName="idTurma">
            @for (turma of turmas(); track turma.id) {
              <mat-option [value]="turma.id">{{ turma.nome }} - {{ turma.serie }} ({{ turma.anoLetivo }})</mat-option>
            }
          </mat-select>
          @if (form.get('idTurma')?.hasError('required') && form.get('idTurma')?.touched) {
            <mat-error>Turma é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Matrícula</mat-label>
          <input matInput formControlName="matricula" placeholder="Ex: 2025001">
          @if (form.get('matricula')?.hasError('required') && form.get('matricula')?.touched) {
            <mat-error>Matrícula é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nome Completo</mat-label>
          <input matInput formControlName="nome" placeholder="Nome do aluno">
          @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Data de Nascimento</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dataNascimento">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="email@exemplo.com">
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Email inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefone do Responsável</mat-label>
          <input matInput formControlName="telefoneResponsavel" placeholder="(00) 00000-0000">
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
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #1976d2; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; padding-top: 16px; }
    .full-width { grid-column: 1 / -1; }
    mat-dialog-content { min-width: 500px; max-height: 70vh; }
  `]
})
export class AlunoFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<AlunoFormDialogComponent>);
  private alunoService = inject(AlunoService);
  private turmaService = inject(TurmaService);
  private fb = inject(FormBuilder);
  data = inject<Aluno | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  turmas = signal<Turma[]>([]);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.loadTurmas();
    
    this.form = this.fb.group({
      idTurma: [this.data?.idTurma || '', Validators.required],
      matricula: [this.data?.matricula || '', Validators.required],
      nome: [this.data?.nome || '', Validators.required],
      dataNascimento: [this.data?.dataNascimento ? new Date(this.data.dataNascimento) : null],
      email: [this.data?.email || '', Validators.email],
      telefoneResponsavel: [this.data?.telefoneResponsavel || ''],
    });
  }

  loadTurmas(): void {
    this.turmaService.findAll({ limit: 100 }).subscribe({
      next: (res: { data: Turma[] }) => this.turmas.set(res.data),
      error: (err: Error) => console.error('Erro ao carregar turmas:', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const formData: any = {
      idTurma: this.form.value.idTurma,
      matricula: this.form.value.matricula,
      nome: this.form.value.nome,
      dataNascimento: this.form.value.dataNascimento 
        ? this.form.value.dataNascimento.toISOString().split('T')[0] 
        : null,
      email: this.form.value.email || null,
      telefoneResponsavel: this.form.value.telefoneResponsavel || null,
    };

    const request$ = this.isEditing
      ? this.alunoService.update(this.data!.id, formData)
      : this.alunoService.create(formData);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
