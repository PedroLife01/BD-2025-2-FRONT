/**
 * ============================================
 * SIGEA Frontend - Página de Estatísticas da Escola
 * ============================================
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { RelatorioService, EscolaService, AuthService } from '../../../core/services';
import { EstatisticasEscola, Escola } from '../../../core/models';

@Component({
  selector: 'app-estatisticas-escola',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  template: `
    <div class="estatisticas-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>bar_chart</mat-icon>
          <mat-card-title>Estatísticas da Escola</mat-card-title>
          <mat-card-subtitle>Visão geral do desempenho institucional</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      @if (isAdmin()) {
        <mat-card class="filter-card">
          <mat-card-content>
            <mat-form-field appearance="outline" class="escola-select">
              <mat-label>Selecionar Escola</mat-label>
              <mat-select [(ngModel)]="selectedEscolaId" (selectionChange)="loadEstatisticas()">
                @for (escola of escolas(); track escola.id) {
                  <mat-option [value]="escola.id">
                    {{ escola.nome }}
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
          <p>Carregando estatísticas...</p>
        </div>
      } @else if (error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon color="warn">error</mat-icon>
            <p>{{ error() }}</p>
            <button mat-raised-button color="primary" (click)="loadEstatisticas()">
              Tentar Novamente
            </button>
          </mat-card-content>
        </mat-card>
      } @else if (estatisticas()) {
        <!-- Informações da Escola -->
        <mat-card class="school-info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>apartment</mat-icon>
            <mat-card-title>{{ estatisticas()!.escola.nome }}</mat-card-title>
          </mat-card-header>
        </mat-card>

        <!-- Cards de Estatísticas Gerais -->
        <div class="stats-cards-grid">
          <mat-card class="stat-card turmas">
            <mat-card-content>
              <mat-icon>class</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ estatisticas()!.totalTurmas }}</span>
                <span class="stat-title">Turmas</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card alunos">
            <mat-card-content>
              <mat-icon>groups</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ estatisticas()!.totalAlunos }}</span>
                <span class="stat-title">Alunos</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card professores">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ estatisticas()!.totalProfessores }}</span>
                <span class="stat-title">Professores</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card coordenadores">
            <mat-card-content>
              <mat-icon>supervisor_account</mat-icon>
              <div class="stat-info">
                <span class="stat-number">{{ estatisticas()!.totalCoordenadores }}</span>
                <span class="stat-title">Coordenadores</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Desempenho Geral -->
        <mat-card class="performance-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>trending_up</mat-icon>
            <mat-card-title>Desempenho Geral</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="performance-grid">
              <div class="performance-item">
                <div class="performance-circle" [class]="getMediaClass(estatisticas()!.mediaGeralEscola)">
                  <span class="performance-value">{{ estatisticas()!.mediaGeralEscola | number:'1.1-1' }}</span>
                </div>
                <span class="performance-label">Média Geral</span>
              </div>
              <div class="performance-item">
                <div class="performance-circle disciplinas">
                  <span class="performance-value">{{ estatisticas()!.totalDisciplinas }}</span>
                </div>
                <span class="performance-label">Disciplinas</span>
              </div>
              <div class="performance-item">
                <div class="performance-circle avaliacoes">
                  <span class="performance-value">{{ estatisticas()!.totalAvaliacoes }}</span>
                </div>
                <span class="performance-label">Avaliações</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Desempenho por Turma -->
        @if (estatisticas()!.desempenhoPorTurma.length > 0) {
          <mat-card class="turmas-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>leaderboard</mat-icon>
              <mat-card-title>Desempenho por Turma</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="estatisticas()!.desempenhoPorTurma" class="full-width">
                <ng-container matColumnDef="turma">
                  <th mat-header-cell *matHeaderCellDef>Turma</th>
                  <td mat-cell *matCellDef="let item">
                    {{ item.turma }} - {{ item.serie }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="totalAlunos">
                  <th mat-header-cell *matHeaderCellDef>Alunos</th>
                  <td mat-cell *matCellDef="let item">{{ item.totalAlunos }}</td>
                </ng-container>

                <ng-container matColumnDef="mediaGeral">
                  <th mat-header-cell *matHeaderCellDef>Média</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class]="getMediaClass(item.mediaGeral)">
                      {{ item.mediaGeral | number:'1.1-1' }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="turmaColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: turmaColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        }
      } @else if (!isAdmin()) {
        <!-- Auto-load para coordenadores -->
      }
    </div>
  `,
  styles: [`
    .estatisticas-container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 16px;
      background: linear-gradient(135deg, #00796b, #26a69a);
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

    .escola-select {
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

    .error-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }

    .school-info-card {
      margin-bottom: 16px;
    }

    .stats-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-card {
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px !important;
    }

    .stat-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-card.turmas {
      border-left: 4px solid #9c27b0;
    }

    .stat-card.turmas mat-icon {
      color: #9c27b0;
    }

    .stat-card.alunos {
      border-left: 4px solid #2196f3;
    }

    .stat-card.alunos mat-icon {
      color: #2196f3;
    }

    .stat-card.professores {
      border-left: 4px solid #ff9800;
    }

    .stat-card.professores mat-icon {
      color: #ff9800;
    }

    .stat-card.coordenadores {
      border-left: 4px solid #4caf50;
    }

    .stat-card.coordenadores mat-icon {
      color: #4caf50;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      line-height: 1;
    }

    .stat-title {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .performance-card {
      margin-bottom: 16px;
    }

    .performance-grid {
      display: flex;
      justify-content: center;
      gap: 64px;
      padding: 24px;
    }

    .performance-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .performance-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }

    .performance-value {
      font-size: 28px;
      font-weight: bold;
    }

    .performance-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
    }

    .turmas-card {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    /* Classes de cores para médias */
    .media-alta {
      color: #4caf50;
    }

    .media-media {
      color: #ff9800;
    }

    .media-baixa {
      color: #f44336;
    }

    .performance-circle.media-alta {
      background: #e8f5e9;
      border: 3px solid #4caf50;
    }

    .performance-circle.media-media {
      background: #fff3e0;
      border: 3px solid #ff9800;
    }

    .performance-circle.media-baixa {
      background: #ffebee;
      border: 3px solid #f44336;
    }

    /* Classes de cores para taxa de aprovação */
    .taxa-alta {
      color: #4caf50;
    }

    .taxa-media {
      color: #ff9800;
    }

    .taxa-baixa {
      color: #f44336;
    }

    .performance-circle.taxa-alta {
      background: #e8f5e9;
      border: 3px solid #4caf50;
    }

    .performance-circle.taxa-media {
      background: #fff3e0;
      border: 3px solid #ff9800;
    }

    .performance-circle.taxa-baixa {
      background: #ffebee;
      border: 3px solid #f44336;
    }
  `],
})
export class EstatisticasEscolaComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private escolaService = inject(EscolaService);
  private authService = inject(AuthService);

  estatisticas = signal<EstatisticasEscola | null>(null);
  escolas = signal<Escola[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedEscolaId: number | null = null;

  turmaColumns = ['turma', 'totalAlunos', 'mediaGeral'];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user?.role === 'ADMIN') {
      this.loadEscolas();
    } else {
      // Coordenador - carrega automaticamente da própria escola
      this.loadMinhaEscola();
    }
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'ADMIN';
  }

  loadEscolas() {
    this.escolaService.findAll({ limit: 1000 }).subscribe({
      next: (res: any) => {
        this.escolas.set(res.data);
      },
      error: (err: any) => {
        console.error('Erro ao carregar escolas:', err);
      },
    });
  }

  loadMinhaEscola() {
    this.loading.set(true);
    this.error.set(null);

    this.relatorioService.getMinhaEscola().subscribe({
      next: (res) => {
        this.estatisticas.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar estatísticas');
        this.loading.set(false);
      },
    });
  }

  loadEstatisticas() {
    if (!this.selectedEscolaId) return;

    this.loading.set(true);
    this.error.set(null);

    this.relatorioService.getEstatisticasEscola(this.selectedEscolaId).subscribe({
      next: (res) => {
        this.estatisticas.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar estatísticas');
        this.loading.set(false);
      },
    });
  }

  getMediaClass(media: number): string {
    if (media >= 7) return 'media-alta';
    if (media >= 5) return 'media-media';
    return 'media-baixa';
  }

  getTaxaClass(taxa: number): string {
    if (taxa >= 70) return 'taxa-alta';
    if (taxa >= 50) return 'taxa-media';
    return 'taxa-baixa';
  }
}
