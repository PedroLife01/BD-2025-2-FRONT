/**
 * ============================================
 * SIGEA Frontend - Página de Boletim
 * ============================================
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { RelatorioService, AlunoService, AuthService } from '../../../core/services';
import { BoletimAluno, Aluno } from '../../../core/models';

@Component({
  selector: 'app-boletim',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  template: `
    <div class="boletim-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>school</mat-icon>
          <mat-card-title>Boletim Escolar</mat-card-title>
          <mat-card-subtitle>
            @if (boletim()) {
              {{ boletim()!.escola.nome }}
            }
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      @if (canSelectAluno()) {
        <mat-card class="filter-card">
          <mat-card-content>
            <mat-form-field appearance="outline" class="aluno-select">
              <mat-label>Selecionar Aluno</mat-label>
              <mat-select [(ngModel)]="selectedAlunoId" (selectionChange)="loadBoletim()">
                @for (aluno of alunos(); track aluno.id) {
                  <mat-option [value]="aluno.id">
                    {{ aluno.nome }} - {{ aluno.matricula }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>
      }

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Carregando boletim...</p>
        </div>
      } @else if (error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon color="warn">error</mat-icon>
            <p>{{ error() }}</p>
            <button mat-raised-button color="primary" (click)="loadBoletim()">
              Tentar Novamente
            </button>
          </mat-card-content>
        </mat-card>
      } @else if (boletim()) {
        <!-- Informações do Aluno -->
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Aluno</span>
                <span class="value">{{ boletim()!.aluno.nome }}</span>
              </div>
              <div class="info-item">
                <span class="label">Matrícula</span>
                <span class="value">{{ boletim()!.aluno.matricula }}</span>
              </div>
              <div class="info-item">
                <span class="label">Turma</span>
                <span class="value">{{ boletim()!.turma.nome }} - {{ boletim()!.turma.serie }}</span>
              </div>
              <div class="info-item">
                <span class="label">Ano Letivo</span>
                <span class="value">{{ boletim()!.turma.anoLetivo }}</span>
              </div>
              <div class="info-item">
                <span class="label">Média Geral</span>
                <span class="value media" [class]="getMediaClass(boletim()!.mediaGeral)">
                  {{ boletim()!.mediaGeral | number:'1.1-1' }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Situação</span>
                <mat-chip [class]="getSituacaoClass(boletim()!.mediaGeral)">
                  {{ getSituacaoLabel(boletim()!.mediaGeral) }}
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Notas por Disciplina -->
        @if (boletim()!.notas.length > 0) {
          <mat-card class="notas-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>grade</mat-icon>
              <mat-card-title>Notas</mat-card-title>
              <mat-card-subtitle>{{ boletim()!.totalAvaliacoes }} avaliações</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="boletim()!.notas" class="notas-table">
                <ng-container matColumnDef="disciplina">
                  <th mat-header-cell *matHeaderCellDef>Disciplina</th>
                  <td mat-cell *matCellDef="let nota">{{ nota.disciplina }}</td>
                </ng-container>

                <ng-container matColumnDef="avaliacao">
                  <th mat-header-cell *matHeaderCellDef>Avaliação</th>
                  <td mat-cell *matCellDef="let nota">{{ nota.avaliacao }}</td>
                </ng-container>

                <ng-container matColumnDef="periodo">
                  <th mat-header-cell *matHeaderCellDef>Período</th>
                  <td mat-cell *matCellDef="let nota">{{ nota.periodo }}</td>
                </ng-container>

                <ng-container matColumnDef="peso">
                  <th mat-header-cell *matHeaderCellDef>Peso</th>
                  <td mat-cell *matCellDef="let nota">{{ nota.peso }}</td>
                </ng-container>

                <ng-container matColumnDef="nota">
                  <th mat-header-cell *matHeaderCellDef>Nota</th>
                  <td mat-cell *matCellDef="let nota">
                    <span [class]="getNotaClass(nota.nota)">
                      {{ nota.nota | number:'1.1-1' }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        } @else {
          <mat-card class="empty-card">
            <mat-card-content>
              <mat-icon>info</mat-icon>
              <p>Nenhuma nota encontrada para este aluno.</p>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .boletim-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 16px;
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      color: white;
    }

    .header-card mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .filter-card {
      margin-bottom: 16px;
    }

    .aluno-select {
      width: 100%;
      max-width: 400px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .error-card {
      margin: 16px 0;
    }

    .error-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }

    .info-card {
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .info-item .value {
      font-size: 16px;
      font-weight: 500;
    }

    .info-item .value.media {
      font-size: 24px;
      font-weight: bold;
    }

    .notas-card {
      margin-bottom: 16px;
    }

    .notas-table {
      width: 100%;
    }

    /* Classes de cores para notas */
    .nota-alta, .media-alta {
      color: #4caf50;
      background-color: #e8f5e9;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .nota-media, .media-media {
      color: #ff9800;
      background-color: #fff3e0;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .nota-baixa, .media-baixa {
      color: #f44336;
      background-color: #ffebee;
      padding: 4px 8px;
      border-radius: 4px;
    }

    /* Chips de situação */
    .situacao-aprovado {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .situacao-reprovado {
      background-color: #f44336 !important;
      color: white !important;
    }

    .situacao-emcurso {
      background-color: #2196f3 !important;
      color: white !important;
    }

    .empty-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 32px;
      color: #666;
    }
  `],
})
export class BoletimComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private alunoService = inject(AlunoService);
  private authService = inject(AuthService);

  boletim = signal<BoletimAluno | null>(null);
  alunos = signal<Aluno[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedAlunoId: number | null = null;

  displayedColumns = ['disciplina', 'avaliacao', 'periodo', 'peso', 'nota'];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user?.role === 'ALUNO') {
      this.loadBoletim();
    } else {
      this.loadAlunos();
    }
  }

  canSelectAluno(): boolean {
    const user = this.authService.currentUser();
    return user?.role !== 'ALUNO';
  }

  loadAlunos() {
    console.log('🔍 [Boletim] Carregando alunos...');
    this.alunoService.findAll({ limit: 1000 }).subscribe({
      next: (res: any) => {
        console.log('✅ [Boletim] Alunos carregados:', res);
        this.alunos.set(res.data || []);
      },
      error: (err: any) => {
        console.error('❌ [Boletim] Erro ao carregar alunos:', err);
      },
    });
  }

  loadBoletim() {
    const user = this.authService.currentUser();

    if (user?.role === 'ALUNO') {
      this.loading.set(true);
      this.error.set(null);

      this.relatorioService.getMeuBoletim().subscribe({
        next: (res) => {
          this.boletim.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao carregar boletim');
          this.loading.set(false);
        },
      });
    } else if (this.selectedAlunoId) {
      this.loading.set(true);
      this.error.set(null);

      this.relatorioService.getBoletimAluno(this.selectedAlunoId).subscribe({
        next: (res) => {
          this.boletim.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao carregar boletim');
          this.loading.set(false);
        },
      });
    }
  }

  getMediaClass(media: number): string {
    if (media >= 7) return 'media-alta';
    if (media >= 5) return 'media-media';
    return 'media-baixa';
  }

  getNotaClass(nota: number): string {
    if (nota >= 7) return 'nota-alta';
    if (nota >= 5) return 'nota-media';
    return 'nota-baixa';
  }

  getSituacaoClass(media: number): string {
    if (media >= 6) return 'situacao-aprovado';
    if (media > 0) return 'situacao-reprovado';
    return 'situacao-emcurso';
  }

  getSituacaoLabel(media: number): string {
    if (media >= 6) return 'Aprovado';
    if (media > 0) return 'Reprovado';
    return 'Em Curso';
  }
}
