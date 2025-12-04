/**
 * ============================================
 * SIGEA Frontend - Página de Relatório de Turma
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
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { RelatorioService, TurmaService } from '../../../core/services';
import { RelatorioTurma, Turma } from '../../../core/models';

@Component({
  selector: 'app-relatorio-turma',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  template: `
    <div class="relatorio-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>assessment</mat-icon>
          <mat-card-title>Relatório de Turma</mat-card-title>
          <mat-card-subtitle>Desempenho acadêmico por turma</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Seleção de Turma -->
      <mat-card class="filter-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="turma-select">
            <mat-label>Selecionar Turma</mat-label>
            <mat-select [(ngModel)]="selectedTurmaId" (selectionChange)="loadRelatorio()">
              @for (turma of turmas(); track turma.id) {
                <mat-option [value]="turma.id">
                  {{ turma.nome }} - {{ turma.serie }} ({{ turma.anoLetivo }})
                </mat-option>
              }
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Carregando relatório...</p>
        </div>
      } @else if (error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon color="warn">error</mat-icon>
            <p>{{ error() }}</p>
            <button mat-raised-button color="primary" (click)="loadRelatorio()">
              Tentar Novamente
            </button>
          </mat-card-content>
        </mat-card>
      } @else if (relatorio()) {
        <!-- Resumo Geral -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>summarize</mat-icon>
            <mat-card-title>{{ relatorio()!.turma.nome }}</mat-card-title>
            <mat-card-subtitle>
              {{ relatorio()!.turma.serie }} - {{ relatorio()!.turma.turno }} | 
              Ano Letivo: {{ relatorio()!.turma.anoLetivo }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <mat-icon>groups</mat-icon>
                <span class="stat-value">{{ relatorio()!.totalAlunos }}</span>
                <span class="stat-label">Alunos</span>
              </div>
              <div class="stat-item">
                <mat-icon>grade</mat-icon>
                <span class="stat-value" [class]="getMediaClass(relatorio()!.mediaGeralTurma)">
                  {{ relatorio()!.mediaGeralTurma | number:'1.1-1' }}
                </span>
                <span class="stat-label">Média Geral</span>
              </div>
              <div class="stat-item aprovados">
                <mat-icon>check_circle</mat-icon>
                <span class="stat-value">{{ getAprovados() }}</span>
                <span class="stat-label">Aprovados</span>
              </div>
              <div class="stat-item reprovados">
                <mat-icon>cancel</mat-icon>
                <span class="stat-value">{{ getReprovados() }}</span>
                <span class="stat-label">Reprovados</span>
              </div>
              <div class="stat-item emcurso">
                <mat-icon>pending</mat-icon>
                <span class="stat-value">{{ getEmCurso() }}</span>
                <span class="stat-label">Em Curso</span>
              </div>
              <div class="stat-item taxa">
                <mat-icon>trending_up</mat-icon>
                <span class="stat-value">{{ getTaxaAprovacao() | number:'1.0-0' }}%</span>
                <span class="stat-label">Taxa de Aprovação</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Desempenho por Disciplina -->
        @if (relatorio()!.disciplinas.length > 0) {
          <mat-card class="disciplinas-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>book</mat-icon>
              <mat-card-title>Desempenho por Disciplina</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="relatorio()!.disciplinas" class="full-width">
                <ng-container matColumnDef="disciplina">
                  <th mat-header-cell *matHeaderCellDef>Disciplina</th>
                  <td mat-cell *matCellDef="let item">{{ item.nome }}</td>
                </ng-container>

                <ng-container matColumnDef="professor">
                  <th mat-header-cell *matHeaderCellDef>Professor</th>
                  <td mat-cell *matCellDef="let item">{{ item.professor }}</td>
                </ng-container>

                <ng-container matColumnDef="mediaGeral">
                  <th mat-header-cell *matHeaderCellDef>Média</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class]="getMediaClass(item.mediaDisciplina)">
                      {{ item.mediaDisciplina | number:'1.1-1' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="totalAvaliacoes">
                  <th mat-header-cell *matHeaderCellDef>Avaliações</th>
                  <td mat-cell *matCellDef="let item">{{ item.totalAvaliacoes }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="disciplinaColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: disciplinaColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }

        <!-- Desempenho dos Alunos -->
        @if (relatorio()!.alunos.length > 0) {
          <mat-card class="alunos-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Desempenho dos Alunos</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="relatorio()!.alunos" class="full-width">
                <ng-container matColumnDef="nome">
                  <th mat-header-cell *matHeaderCellDef>Aluno</th>
                  <td mat-cell *matCellDef="let item">{{ item.aluno.nome }}</td>
                </ng-container>

                <ng-container matColumnDef="matricula">
                  <th mat-header-cell *matHeaderCellDef>Matrícula</th>
                  <td mat-cell *matCellDef="let item">{{ item.aluno.matricula }}</td>
                </ng-container>

                <ng-container matColumnDef="media">
                  <th mat-header-cell *matHeaderCellDef>Média</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class]="getMediaClass(item.mediaGeral)">
                      {{ item.mediaGeral | number:'1.1-1' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="situacao">
                  <th mat-header-cell *matHeaderCellDef>Situação</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip [class]="getSituacaoClass(item.situacao)">
                      {{ item.situacao }}
                    </mat-chip>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="alunoColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: alunoColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
      } @else {
        <mat-card class="empty-card">
          <mat-card-content>
            <mat-icon>info</mat-icon>
            <p>Selecione uma turma para visualizar o relatório</p>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .relatorio-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 16px;
      background: linear-gradient(135deg, #7b1fa2, #ba68c8);
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

    .turma-select {
      width: 100%;
      max-width: 500px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .error-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }

    .summary-card {
      margin-bottom: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 24px;
      margin-top: 16px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-radius: 8px;
      background: #f5f5f5;
    }

    .stat-item mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #666;
    }

    .stat-item.aprovados {
      background: #e8f5e9;
    }

    .stat-item.aprovados mat-icon {
      color: #4caf50;
    }

    .stat-item.reprovados {
      background: #ffebee;
    }

    .stat-item.reprovados mat-icon {
      color: #f44336;
    }

    .stat-item.emcurso {
      background: #e3f2fd;
    }

    .stat-item.emcurso mat-icon {
      color: #2196f3;
    }

    .stat-item.taxa {
      background: #fff3e0;
    }

    .stat-item.taxa mat-icon {
      color: #ff9800;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .disciplinas-card, .alunos-card {
      margin-bottom: 16px;
    }

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

    .full-width {
      width: 100%;
    }

    .periodos-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .periodo-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      border-radius: 8px;
      background: #f5f5f5;
      min-width: 120px;
    }

    .periodo-nome {
      font-weight: 500;
      color: #333;
    }

    .periodo-media {
      font-size: 24px;
      font-weight: bold;
      padding: 4px 12px;
      border-radius: 8px;
    }

    /* Classes de cores para médias/notas */
    .media-alta, .nota-alta {
      color: #4caf50;
    }

    .media-media, .nota-media {
      color: #ff9800;
    }

    .media-baixa, .nota-baixa {
      color: #f44336;
    }

    .empty-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #666;
    }
  `],
})
export class RelatorioTurmaComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private turmaService = inject(TurmaService);

  relatorio = signal<RelatorioTurma | null>(null);
  turmas = signal<Turma[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedTurmaId: number | null = null;

  disciplinaColumns = ['disciplina', 'professor', 'mediaGeral', 'totalAvaliacoes'];
  alunoColumns = ['nome', 'matricula', 'media', 'situacao'];

  ngOnInit() {
    this.loadTurmas();
  }

  loadTurmas() {
    console.log('🔍 [RelatorioTurma] Carregando turmas...');
    this.turmaService.findAll({ limit: 1000 }).subscribe({
      next: (res: any) => {
        console.log('✅ [RelatorioTurma] Turmas carregadas:', res);
        this.turmas.set(res.data || []);
      },
      error: (err: any) => {
        console.error('❌ [RelatorioTurma] Erro ao carregar turmas:', err);
      },
    });
  }

  loadRelatorio() {
    if (!this.selectedTurmaId) return;

    this.loading.set(true);
    this.error.set(null);

    this.relatorioService.getRelatorioTurma(this.selectedTurmaId).subscribe({
      next: (res) => {
        this.relatorio.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar relatório');
        this.loading.set(false);
      },
    });
  }

  getMediaClass(media: number): string {
    if (media >= 7) return 'media-alta';
    if (media >= 5) return 'media-media';
    return 'media-baixa';
  }

  getSituacaoClass(situacao: string): string {
    if (situacao === 'Aprovado') return 'situacao-aprovado';
    if (situacao === 'Reprovado') return 'situacao-reprovado';
    return 'situacao-emcurso';
  }

  getAprovados(): number {
    return this.relatorio()?.alunos.filter(a => a.situacao === 'Aprovado').length || 0;
  }

  getReprovados(): number {
    return this.relatorio()?.alunos.filter(a => a.situacao === 'Reprovado').length || 0;
  }

  getEmCurso(): number {
    return this.relatorio()?.alunos.filter(a => a.situacao === 'Em andamento').length || 0;
  }

  getTaxaAprovacao(): number {
    const total = this.relatorio()?.totalAlunos || 0;
    const aprovados = this.getAprovados();
    return total > 0 ? (aprovados / total) * 100 : 0;
  }
}
