/**
 * ============================================
 * SIGEA Frontend - Avaliação Form Dialog Component
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AvaliacaoService, VinculoService, PeriodoLetivoService } from '../../../core/services';
import { Avaliacao, TurmaProfessor, PeriodoLetivo } from '../../../core/models';

@Component({
  selector: 'app-avaliacao-form-dialog',
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
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'assignment' }}</mat-icon>
      {{ isEditing ? 'Editar Avaliação' : 'Nova Avaliação' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Título da Avaliação</mat-label>
          <input matInput formControlName="titulo" placeholder="Ex: Prova 1 - Matemática">
          @if (form.get('titulo')?.hasError('required') && form.get('titulo')?.touched) {
            <mat-error>Título é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Vínculo (Turma/Professor/Disciplina)</mat-label>
          <mat-select formControlName="idTurmaProfessor">
            @for (vinculo of vinculos(); track vinculo.id) {
              <mat-option [value]="vinculo.id">
                {{ vinculo.turma?.nome }} - {{ vinculo.disciplina?.nome }} ({{ vinculo.professor?.nome }})
              </mat-option>
            }
          </mat-select>
          @if (form.get('idTurmaProfessor')?.hasError('required') && form.get('idTurmaProfessor')?.touched) {
            <mat-error>Vínculo é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Período Letivo</mat-label>
          <mat-select formControlName="idPeriodoLetivo">
            @for (periodo of periodos(); track periodo.id) {
              <mat-option [value]="periodo.id">
                {{ periodo.ano }} - {{ periodo.etapa }}
              </mat-option>
            }
          </mat-select>
          @if (form.get('idPeriodoLetivo')?.hasError('required') && form.get('idPeriodoLetivo')?.touched) {
            <mat-error>Período Letivo é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="Prova">Prova</mat-option>
            <mat-option value="Trabalho">Trabalho</mat-option>
            <mat-option value="Exercício">Exercício</mat-option>
            <mat-option value="Seminário">Seminário</mat-option>
            <mat-option value="Participação">Participação</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Data de Aplicação</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dataAplicacao">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          @if (form.get('dataAplicacao')?.hasError('required') && form.get('dataAplicacao')?.touched) {
            <mat-error>Data é obrigatória</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Peso</mat-label>
          <input matInput type="number" formControlName="peso" placeholder="1">
        </mat-form-field>

        <!-- Upload de Arquivo PDF -->
        <div class="file-upload-section full-width">
          <div class="file-upload-label">
            <mat-icon>picture_as_pdf</mat-icon>
            <span>Arquivo da Prova (PDF)</span>
          </div>
          
          <div class="file-upload-container">
            @if (selectedFile()) {
              <div class="file-selected">
                <mat-icon color="primary">description</mat-icon>
                <span>{{ selectedFile()?.name }}</span>
                <span class="file-size">({{ formatFileSize(selectedFile()?.size || 0) }})</span>
                <button mat-icon-button color="warn" (click)="removeFile()" type="button">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            } @else if (data?.temArquivo) {
              <div class="file-existing">
                <mat-icon color="primary">picture_as_pdf</mat-icon>
                <span>Arquivo existente</span>
                <button mat-stroked-button color="primary" (click)="downloadExistingFile()" type="button">
                  <mat-icon>download</mat-icon>
                  Baixar
                </button>
                <button mat-stroked-button color="warn" (click)="removeExistingFile()" type="button">
                  <mat-icon>delete</mat-icon>
                  Remover
                </button>
              </div>
            } @else {
              <div class="file-dropzone" 
                   (click)="fileInput.click()"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave($event)"
                   (drop)="onDrop($event)"
                   [class.dragover]="isDragOver()">
                <mat-icon>cloud_upload</mat-icon>
                <span>Clique ou arraste um arquivo PDF aqui</span>
                <small>Máximo 10MB</small>
              </div>
            }
            <input #fileInput type="file" accept=".pdf" (change)="onFileSelected($event)" hidden>
          </div>
        </div>
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
    h2 { display: flex; align-items: center; gap: 8px; mat-icon { color: #d32f2f; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; padding-top: 16px; }
    .full-width { grid-column: 1 / -1; }
    mat-dialog-content { min-width: 500px; }

    .file-upload-section {
      margin-top: 8px;
      margin-bottom: 16px;
    }

    .file-upload-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;

      mat-icon {
        color: #d32f2f;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .file-upload-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }

    .file-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover, &.dragover {
        border-color: #1976d2;
        background: #e3f2fd;
      }

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #1976d2;
      }

      span {
        color: #666;
      }

      small {
        color: #999;
      }
    }

    .file-selected, .file-existing {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      span {
        flex: 1;
        font-weight: 500;
      }

      .file-size {
        color: #666;
        font-weight: normal;
      }
    }
  `]
})
export class AvaliacaoFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<AvaliacaoFormDialogComponent>);
  private avaliacaoService = inject(AvaliacaoService);
  private vinculoService = inject(VinculoService);
  private periodoLetivoService = inject(PeriodoLetivoService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  data = inject<Avaliacao | null>(MAT_DIALOG_DATA, { optional: true });

  form!: FormGroup;
  loading = signal(false);
  vinculos = signal<TurmaProfessor[]>([]);
  periodos = signal<PeriodoLetivo[]>([]);
  selectedFile = signal<File | null>(null);
  isDragOver = signal(false);

  get isEditing(): boolean { return !!this.data; }

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: [this.data?.titulo || '', Validators.required],
      idTurmaProfessor: [this.data?.idTurmaProfessor || '', Validators.required],
      idPeriodoLetivo: [this.data?.idPeriodoLetivo || '', Validators.required],
      tipo: [this.data?.tipo || ''],
      dataAplicacao: [this.data?.dataAplicacao ? new Date(this.data.dataAplicacao) : null, Validators.required],
      peso: [this.data?.peso || 1],
    });
    this.loadVinculos();
    this.loadPeriodos();
  }

  loadVinculos(): void {
    this.vinculoService.findAll({ limit: 100 }).subscribe({
      next: (res) => this.vinculos.set(res.data)
    });
  }

  loadPeriodos(): void {
    this.periodoLetivoService.findAll({ limit: 100 }).subscribe({
      next: (res) => this.periodos.set(res.data)
    });
  }

  // File handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    if (event.dataTransfer?.files.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.snackBar.open('Apenas arquivos PDF são permitidos', 'Fechar', { duration: 3000 });
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      this.snackBar.open('Arquivo muito grande. Máximo permitido: 10MB', 'Fechar', { duration: 3000 });
      return;
    }
    this.selectedFile.set(file);
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  downloadExistingFile(): void {
    if (!this.data?.id) return;
    this.avaliacaoService.downloadArquivo(this.data.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prova_${this.data!.titulo.replace(/\s+/g, '_')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Erro ao baixar arquivo', 'Fechar', { duration: 3000 })
    });
  }

  removeExistingFile(): void {
    if (!this.data?.id) return;
    if (confirm('Tem certeza que deseja remover o arquivo da prova?')) {
      this.avaliacaoService.removeArquivo(this.data.id).subscribe({
        next: () => {
          this.data!.temArquivo = false;
          this.snackBar.open('Arquivo removido com sucesso', 'Fechar', { duration: 3000 });
        },
        error: () => this.snackBar.open('Erro ao remover arquivo', 'Fechar', { duration: 3000 })
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const formData: any = {
      titulo: this.form.value.titulo,
      idTurmaProfessor: this.form.value.idTurmaProfessor,
      idPeriodoLetivo: this.form.value.idPeriodoLetivo,
      tipo: this.form.value.tipo || null,
      dataAplicacao: this.form.value.dataAplicacao 
        ? this.form.value.dataAplicacao.toISOString().split('T')[0] 
        : null,
      peso: this.form.value.peso || 1,
    };

    const file = this.selectedFile();

    // Use métodos com arquivo se houver arquivo selecionado
    const request$ = this.isEditing
      ? (file 
          ? this.avaliacaoService.updateWithFile(this.data!.id, formData, file)
          : this.avaliacaoService.update(this.data!.id, formData))
      : (file
          ? this.avaliacaoService.createWithFile(formData, file)
          : this.avaliacaoService.create(formData));

    request$.subscribe({
      next: (res) => {
        this.snackBar.open(
          this.isEditing ? 'Avaliação atualizada com sucesso' : 'Avaliação criada com sucesso',
          'Fechar',
          { duration: 3000 }
        );
        this.dialogRef.close(res.data);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao salvar avaliação', 'Fechar', { duration: 3000 });
      }
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
