/**
 * ============================================
 * SIGEA Frontend - Vínculo Form Dialog Component
 * ============================================
 * TurmaProfessor: id_turma_professor, id_turma, id_professor, id_disciplina
 * Não tem: idPeriodoLetivo, ativo
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

import { VinculoService, TurmaService, ProfessorService, DisciplinaService } from '../../../core/services';
import { TurmaProfessor, Turma, Professor, Disciplina } from '../../../core/models';

@Component({
  selector: 'app-vinculo-form-dialog',
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
      <mat-icon>{{ isEditing ? 'edit' : 'link' }}</mat-icon>
      {{ isEditing ? 'Editar Vínculo' : 'Novo Vínculo' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
          <mat-label>Professor</mat-label>
          <mat-select formControlName="idProfessor">
            @for (professor of professores(); track professor.id) {
              <mat-option [value]="professor.id">{{ professor.nome }}</mat-option>
            }
          </mat-select>
          @if (form.get('idProfessor')?.hasError('required') && form.get('idProfessor')?.touched) {
            <mat-error>Professor é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Turma</mat-label>
          <mat-select formControlName="idTurma">
            @for (turma of turmas(); track turma.id) {
              <mat-option [value]="turma.id">{{ turma.nome }} ({{ turma.anoLetivo }})</mat-option>
            }
          </mat-select>
          @if (form.get('idTurma')?.hasError('required') && form.get('idTurma')?.touched) {
            <mat-error>Turma é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Disciplina</mat-label>
          <mat-select formControlName="idDisciplina">
            @for (disciplina of disciplinas(); track disciplina.id) {
              <mat-option [value]="disciplina.id">{{ disciplina.nome }}</mat-option>
            }
          </mat-select>
          @if (form.get('idDisciplina')?.hasError('required') && form.get('idDisciplina')?.touched) {
            <mat-error>Disciplina é obrigatória</mat-error>
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
          {{ isEditing ? 'Salvar' : 'Criar' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #0288d1; } }
    .form-column { display: flex; flex-direction: column; padding-top: 16px; }
    mat-dialog-content { min-width: 450px; }
  `]
})
export class VinculoFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<VinculoFormDialogComponent>);
  private vinculoService = inject(VinculoService);
  private turmaService = inject(TurmaService);
  private professorService = inject(ProfessorService);
  private disciplinaService = inject(DisciplinaService);
  private fb = inject(FormBuilder);
  data = inject<TurmaProfessor | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  turmas = signal<Turma[]>([]);
  professores = signal<Professor[]>([]);
  disciplinas = signal<Disciplina[]>([]);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      idProfessor: [this.data?.idProfessor || '', Validators.required],
      idTurma: [this.data?.idTurma || '', Validators.required],
      idDisciplina: [this.data?.idDisciplina || '', Validators.required],
    });
    this.loadSelects();
  }

  loadSelects(): void {
    this.turmaService.findAll({ limit: 100 }).subscribe({ next: (res) => this.turmas.set(res.data) });
    this.professorService.findAll({ limit: 100 }).subscribe({ next: (res) => this.professores.set(res.data) });
    this.disciplinaService.findAll({ limit: 100 }).subscribe({ next: (res) => this.disciplinas.set(res.data) });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const request$ = this.isEditing
      ? this.vinculoService.update(this.data!.id, this.form.value)
      : this.vinculoService.create(this.form.value);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
