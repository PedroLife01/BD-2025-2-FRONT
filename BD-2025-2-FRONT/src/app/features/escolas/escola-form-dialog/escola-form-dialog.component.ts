/**
 * ============================================
 * SIGEA Frontend - Escola Form Dialog Component
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

import { EscolaService } from '../../../core/services';
import { Escola, EscolaInput } from '../../../core/models';

@Component({
  selector: 'app-escola-form-dialog',
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
      <mat-icon>{{ isEditing ? 'edit' : 'add_business' }}</mat-icon>
      {{ isEditing ? 'Editar Escola' : 'Nova Escola' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome da Escola</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Escola Municipal João Paulo">
          <mat-icon matSuffix>business</mat-icon>
          @if (form.get('nome')?.hasError('required') && form.get('nome')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
          @if (form.get('nome')?.hasError('minlength')) {
            <mat-error>Nome deve ter pelo menos 3 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>CNPJ</mat-label>
          <input matInput formControlName="cnpj" placeholder="00000000000000" maxlength="14">
          <mat-icon matSuffix>badge</mat-icon>
          <mat-hint>Somente números (14 dígitos)</mat-hint>
          @if (form.get('cnpj')?.hasError('pattern')) {
            <mat-error>CNPJ deve conter 14 dígitos numéricos</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="escola@email.com">
          <mat-icon matSuffix>email</mat-icon>
          @if (form.get('email')?.hasError('email')) {
            <mat-error>Email inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="telefone" placeholder="(61) 99999-9999">
          <mat-icon matSuffix>phone</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Região Administrativa</mat-label>
          <input matInput formControlName="regiaoAdministrativa" placeholder="Ex: Asa Norte, Taguatinga">
          <mat-icon matSuffix>location_on</mat-icon>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="loading() || form.invalid"
      >
        @if (loading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <ng-container><mat-icon>{{ isEditing ? 'save' : 'add' }}</mat-icon> {{ isEditing ? 'Salvar' : 'Criar' }}</ng-container>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;

      mat-icon {
        color: #1976d2;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
      padding-top: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-dialog-content {
      min-width: 400px;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class EscolaFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EscolaFormDialogComponent>);
  private escolaService = inject(EscolaService);
  private fb = inject(FormBuilder);
  
  data = inject<Escola | null>(MAT_DIALOG_DATA, { optional: true });
  
  form!: FormGroup;
  loading = signal(false);

  get isEditing(): boolean {
    return !!this.data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: [this.data?.nome || '', [Validators.required, Validators.minLength(3)]],
      cnpj: [this.data?.cnpj || '', [Validators.pattern(/^\d{14}$/)]],
      email: [this.data?.email || '', [Validators.email]],
      telefone: [this.data?.telefone || ''],
      regiaoAdministrativa: [this.data?.regiaoAdministrativa || ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formData = this.cleanFormData(this.form.value);

    const request$ = this.isEditing
      ? this.escolaService.update(this.data!.id, formData)
      : this.escolaService.create(formData);

    request$.subscribe({
      next: (response) => {
        this.dialogRef.close(response.data);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erro ao salvar escola:', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private cleanFormData(data: EscolaInput): EscolaInput {
    return {
      nome: data.nome,
      cnpj: data.cnpj || null,
      email: data.email || null,
      telefone: data.telefone || null,
      regiaoAdministrativa: data.regiaoAdministrativa || null,
    };
  }
}
