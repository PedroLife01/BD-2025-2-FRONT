/**
 * ============================================
 * SIGEA Frontend - Regra Form Dialog Component
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

import { RegraAprovacaoService, EscolaService, CoordenadorService } from '../../../core/services';
import { RegraAprovacao, Escola, Coordenador } from '../../../core/models';

@Component({
  selector: 'app-regra-form-dialog',
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
      <mat-icon>{{ isEditing ? 'edit' : 'rule' }}</mat-icon>
      {{ isEditing ? 'Editar Regra' : 'Nova Regra de Aprovação' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-column">
        <mat-form-field appearance="outline">
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
          <mat-label>Coordenador</mat-label>
          <mat-select formControlName="idCoordenador">
            @for (coordenador of coordenadores(); track coordenador.id) {
              <mat-option [value]="coordenador.id">{{ coordenador.nome }}</mat-option>
            }
          </mat-select>
          @if (form.get('idCoordenador')?.hasError('required') && form.get('idCoordenador')?.touched) {
            <mat-error>Coordenador é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ano Letivo</mat-label>
          <input matInput type="number" formControlName="anoLetivo" placeholder="Ex: 2025">
          @if (form.get('anoLetivo')?.hasError('required') && form.get('anoLetivo')?.touched) {
            <mat-error>Ano letivo é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Média Mínima para Aprovação</mat-label>
          <input matInput type="number" formControlName="mediaMinima" placeholder="6.0" step="0.1">
          @if (form.get('mediaMinima')?.hasError('required') && form.get('mediaMinima')?.touched) {
            <mat-error>Média mínima é obrigatória</mat-error>
          }
          @if (form.get('mediaMinima')?.hasError('min')) {
            <mat-error>Média deve ser maior ou igual a 0</mat-error>
          }
          @if (form.get('mediaMinima')?.hasError('max')) {
            <mat-error>Média deve ser menor ou igual a 10</mat-error>
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
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #673ab7; } }
    .form-column { display: flex; flex-direction: column; padding-top: 16px; }
    mat-dialog-content { min-width: 400px; }
  `]
})
export class RegraFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<RegraFormDialogComponent>);
  private regraService = inject(RegraAprovacaoService);
  private escolaService = inject(EscolaService);
  private coordenadorService = inject(CoordenadorService);
  private fb = inject(FormBuilder);
  data = inject<RegraAprovacao | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  escolas = signal<Escola[]>([]);
  coordenadores = signal<Coordenador[]>([]);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      idEscola: [this.data?.idEscola || '', Validators.required],
      idCoordenador: [this.data?.idCoordenador || '', Validators.required],
      anoLetivo: [this.data?.anoLetivo || new Date().getFullYear(), Validators.required],
      mediaMinima: [this.data?.mediaMinima || 6, [Validators.required, Validators.min(0), Validators.max(10)]],
    });
    this.loadSelects();
  }

  loadSelects(): void {
    this.escolaService.findAll({ limit: 100 }).subscribe({
      next: (res) => this.escolas.set(res.data)
    });
    this.coordenadorService.findAll({ limit: 100 }).subscribe({
      next: (res) => this.coordenadores.set(res.data)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const formData: any = {
      idEscola: this.form.value.idEscola,
      idCoordenador: this.form.value.idCoordenador,
      anoLetivo: parseInt(this.form.value.anoLetivo),
      mediaMinima: parseFloat(this.form.value.mediaMinima),
    };

    const request$ = this.isEditing
      ? this.regraService.update(this.data!.id, formData)
      : this.regraService.create(formData);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res.data),
      error: () => this.loading.set(false)
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
