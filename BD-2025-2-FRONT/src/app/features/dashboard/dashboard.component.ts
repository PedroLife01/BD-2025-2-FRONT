/**
 * ============================================
 * SIGEA Frontend - Dashboard Component
 * ============================================
 * Dashboard adaptativo por role do usuário
 * ============================================
 */

import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '../../core/services/auth.service';
import { EscolaService, TurmaService, AlunoService, ProfessorService, RelatorioService } from '../../core/services';
import { ApiResponse, Escola, Turma, Aluno, Professor, Role } from '../../core/models';

interface DashboardCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  route: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  roles: Role[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
  ],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section" [style.background]="getWelcomeGradient()">
        <div class="welcome-content">
          <h1>Bem-vindo, {{ authService.currentUser()?.nome }}!</h1>
          <p>{{ getWelcomeMessage() }}</p>
        </div>
        <div class="welcome-icon">
          <mat-icon>{{ getRoleIcon() }}</mat-icon>
        </div>
      </div>

      <!-- Stats Cards - Visível para ADMIN e COORDENADOR -->
      @if (authService.isAdmin() || authService.isCoordenador()) {
        <div class="stats-grid">
          @for (card of cards(); track card.title) {
            <mat-card class="stat-card" [routerLink]="card.route">
              <div class="stat-icon" [style.background]="card.color">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ card.value }}</span>
                <span class="stat-title">{{ card.title }}</span>
              </div>
            </mat-card>
          }
        </div>
      }

      <!-- Dashboard para PROFESSOR -->
      @if (authService.isProfessor()) {
        <div class="professor-dashboard">
          <div class="stats-grid">
            <mat-card class="stat-card" routerLink="/turmas">
              <div class="stat-icon" style="background: #388e3c">
                <mat-icon>groups</mat-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ minhasTurmas().length }}</span>
                <span class="stat-title">Minhas Turmas</span>
              </div>
            </mat-card>
            <mat-card class="stat-card" routerLink="/avaliacoes">
              <div class="stat-icon" style="background: #f57c00">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ minhasAvaliacoes() }}</span>
                <span class="stat-title">Avaliações</span>
              </div>
            </mat-card>
            <mat-card class="stat-card" routerLink="/notas">
              <div class="stat-icon" style="background: #7b1fa2">
                <mat-icon>grade</mat-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ notasPendentes() }}</span>
                <span class="stat-title">Notas Pendentes</span>
              </div>
            </mat-card>
          </div>

          <!-- Turmas do Professor -->
          <mat-card class="turmas-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>class</mat-icon>
                Minhas Turmas
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (minhasTurmas().length > 0) {
                <div class="turmas-list">
                  @for (turma of minhasTurmas(); track turma.id) {
                    <div class="turma-item" [routerLink]="['/turmas', turma.id]">
                      <div class="turma-info">
                        <strong>{{ turma.nome }}</strong>
                        <span>{{ turma.serie }} - {{ turma.turno }}</span>
                      </div>
                      <mat-icon>chevron_right</mat-icon>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-message">Nenhuma turma vinculada.</p>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Dashboard para ALUNO -->
      @if (isAluno()) {
        <div class="aluno-dashboard">
          <mat-card class="boletim-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>school</mat-icon>
                Meu Boletim
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="boletim-info">
                <div class="info-item">
                  <mat-icon>class</mat-icon>
                  <div>
                    <span class="label">Turma</span>
                    <span class="value">{{ minhaTurma()?.nome || 'Não definida' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon>business</mat-icon>
                  <div>
                    <span class="label">Escola</span>
                    <span class="value">{{ minhaEscola()?.nome || 'Não definida' }}</span>
                  </div>
                </div>
              </div>
              <button mat-raised-button color="primary" routerLink="/relatorios/boletim" class="boletim-btn">
                <mat-icon>description</mat-icon>
                Ver Boletim Completo
              </button>
            </mat-card-content>
          </mat-card>

          <!-- Notas Recentes do Aluno -->
          <mat-card class="notas-recentes-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>grade</mat-icon>
                Notas Recentes
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (notasRecentes().length > 0) {
                <div class="notas-list">
                  @for (nota of notasRecentes(); track nota.id) {
                    <div class="nota-item">
                      <div class="nota-info">
                        <strong>{{ nota.avaliacao?.titulo }}</strong>
                        <span>{{ nota.avaliacao?.turmaProfessor?.disciplina?.nome }}</span>
                      </div>
                      <span class="nota-valor" [class.aprovado]="nota.notaObtida >= 6" [class.reprovado]="nota.notaObtida < 6">
                        {{ nota.notaObtida | number:'1.1-1' }}
                      </span>
                    </div>
                  }
                </div>
              } @else {
                <p class="empty-message">Nenhuma nota lançada ainda.</p>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Quick Actions - Adaptativo por role -->
      @if (!isAluno()) {
        <mat-card class="quick-actions">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>flash_on</mat-icon>
              Ações Rápidas
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actions-grid">
              @for (action of filteredActions(); track action.label) {
                <button mat-stroked-button [routerLink]="action.route" class="action-btn">
                  <mat-icon>{{ action.icon }}</mat-icon>
                  {{ action.label }}
                </button>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Bottom Section -->
      <div class="bottom-section">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>info</mat-icon>
              {{ getInfoTitle() }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (authService.isAdmin()) {
              <p>Como administrador, você tem acesso completo ao sistema:</p>
              <ul>
                <li>Gestão de todas as escolas e turmas</li>
                <li>Cadastro de coordenadores e professores</li>
                <li>Visualização de relatórios gerais</li>
                <li>Configuração de regras de aprovação</li>
              </ul>
            } @else if (authService.isCoordenador()) {
              <p>Como coordenador, você pode gerenciar sua escola:</p>
              <ul>
                <li>Gerenciar turmas e alunos</li>
                <li>Vincular professores às disciplinas</li>
                <li>Definir regras de aprovação</li>
                <li>Acompanhar desempenho dos alunos</li>
              </ul>
            } @else if (authService.isProfessor()) {
              <p>Como professor, você pode:</p>
              <ul>
                <li>Visualizar suas turmas e alunos</li>
                <li>Criar e gerenciar avaliações</li>
                <li>Lançar e editar notas</li>
                <li>Acompanhar desempenho da turma</li>
              </ul>
            } @else {
              <p>Como aluno, você pode:</p>
              <ul>
                <li>Visualizar seu boletim</li>
                <li>Acompanhar suas notas</li>
                <li>Ver avaliações pendentes</li>
                <li>Consultar seu desempenho</li>
              </ul>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="user-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>account_circle</mat-icon>
              Seu Perfil
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="profile-info">
              <div class="profile-avatar" [style.background]="getRoleColor()">
                <mat-icon>{{ getRoleIcon() }}</mat-icon>
              </div>
              <div class="profile-details">
                <h3>{{ authService.currentUser()?.nome }}</h3>
                <p>{{ authService.currentUser()?.email }}</p>
                <span class="role-badge" [style.background]="getRoleColor()" [style.color]="'white'">
                  {{ getRoleLabel() }}
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      color: white;
    }

    .welcome-content h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 600;
    }

    .welcome-content p {
      margin: 0;
      opacity: 0.9;
    }

    .welcome-icon mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      opacity: 0.3;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 12px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      mat-icon {
        color: white;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .stat-title {
      font-size: 14px;
      color: #666;
    }

    /* Professor Dashboard */
    .professor-dashboard, .aluno-dashboard {
      margin-bottom: 24px;
    }

    .turmas-card, .boletim-card, .notas-recentes-card {
      margin-top: 24px;
      border-radius: 12px;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
      }
    }

    .turmas-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .turma-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #e0e0e0;
      }

      .turma-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        strong {
          font-size: 14px;
        }

        span {
          font-size: 12px;
          color: #666;
        }
      }
    }

    /* Aluno Dashboard */
    .aluno-dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .boletim-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;

      mat-icon {
        color: #1976d2;
      }

      div {
        display: flex;
        flex-direction: column;

        .label {
          font-size: 12px;
          color: #666;
        }

        .value {
          font-size: 16px;
          font-weight: 500;
        }
      }
    }

    .boletim-btn {
      width: 100%;
    }

    .notas-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nota-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;

      .nota-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        strong {
          font-size: 14px;
        }

        span {
          font-size: 12px;
          color: #666;
        }
      }

      .nota-valor {
        font-size: 18px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 8px;

        &.aprovado {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.reprovado {
          background: #ffebee;
          color: #c62828;
        }
      }
    }

    .empty-message {
      text-align: center;
      color: #666;
      padding: 24px;
    }

    .quick-actions {
      margin-bottom: 24px;
      border-radius: 12px;

      mat-card-header {
        margin-bottom: 16px;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
    }

    .action-btn {
      height: 80px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .bottom-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .info-card, .user-card {
      border-radius: 12px;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
      }
    }

    .info-card p {
      color: #666;
      line-height: 1.6;
    }

    .info-card ul {
      color: #666;
      padding-left: 20px;

      li {
        margin-bottom: 8px;
      }
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .profile-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: white;
      }
    }

    .profile-details {
      h3 {
        margin: 0 0 4px;
        font-size: 18px;
      }

      p {
        margin: 0 0 8px;
        color: #666;
        font-size: 14px;
      }

      .role-badge {
        padding: 4px 12px;
        border-radius: 16px;
        font-weight: 500;
        font-size: 12px;
        text-transform: uppercase;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private escolaService = inject(EscolaService);
  private turmaService = inject(TurmaService);
  private alunoService = inject(AlunoService);
  private professorService = inject(ProfessorService);
  private relatorioService = inject(RelatorioService);

  cards = signal<DashboardCard[]>([
    { title: 'Escolas', value: 0, icon: 'business', color: '#1976d2', route: '/escolas' },
    { title: 'Turmas', value: 0, icon: 'groups', color: '#388e3c', route: '/turmas' },
    { title: 'Alunos', value: 0, icon: 'school', color: '#f57c00', route: '/alunos' },
    { title: 'Professores', value: 0, icon: 'person', color: '#7b1fa2', route: '/professores' },
  ]);

  // Dados específicos por role
  minhasTurmas = signal<Turma[]>([]);
  minhasAvaliacoes = signal<number>(0);
  notasPendentes = signal<number>(0);
  minhaTurma = signal<Turma | null>(null);
  minhaEscola = signal<Escola | null>(null);
  notasRecentes = signal<any[]>([]);

  // Ações rápidas configuráveis por role
  quickActions: QuickAction[] = [
    { label: 'Nova Escola', icon: 'add_business', route: '/escolas', roles: ['ADMIN'] },
    { label: 'Novo Aluno', icon: 'person_add', route: '/alunos', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Nova Turma', icon: 'group_add', route: '/turmas', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Novo Professor', icon: 'person_add', route: '/professores', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Nova Avaliação', icon: 'assignment_add', route: '/avaliacoes', roles: ['PROFESSOR'] },
    { label: 'Lançar Notas', icon: 'edit_note', route: '/notas', roles: ['PROFESSOR'] },
    { label: 'Vincular Professor', icon: 'link', route: '/vinculos', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Regras Aprovação', icon: 'rule', route: '/regras', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Relatórios', icon: 'assessment', route: '/relatorios', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR'] },
  ];

  filteredActions = computed(() => {
    const role = this.authService.currentUser()?.role;
    if (!role) return [];
    return this.quickActions.filter(action => action.roles.includes(role));
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    const role = this.authService.currentUser()?.role;

    if (role === 'ADMIN' || role === 'COORDENADOR') {
      this.loadAdminStats();
    } else if (role === 'PROFESSOR') {
      this.loadProfessorData();
    } else if (role === 'ALUNO') {
      this.loadAlunoData();
    }
  }

  private loadAdminStats(): void {
    this.escolaService.findAll({ limit: 1 }).subscribe({
      next: (res) => this.updateCard('Escolas', res.pagination?.total || res.meta?.total || 0)
    });

    this.turmaService.findAll({ limit: 1 }).subscribe({
      next: (res) => this.updateCard('Turmas', res.pagination?.total || res.meta?.total || 0)
    });

    this.alunoService.findAll({ limit: 1 }).subscribe({
      next: (res) => this.updateCard('Alunos', res.pagination?.total || res.meta?.total || 0)
    });

    this.professorService.findAll({ limit: 1 }).subscribe({
      next: (res) => this.updateCard('Professores', res.pagination?.total || res.meta?.total || 0)
    });
  }

  private loadProfessorData(): void {
    // Carregar turmas do professor
    this.turmaService.findAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.minhasTurmas.set(res.data || []);
      }
    });
  }

  private loadAlunoData(): void {
    const user = this.authService.currentUser();
    if (user?.aluno?.turma) {
      this.minhaTurma.set(user.aluno.turma);
      this.minhaEscola.set(user.aluno.turma.escola || null);
    }
  }

  isAluno(): boolean {
    return this.authService.currentUser()?.role === 'ALUNO';
  }

  private updateCard(title: string, value: number): void {
    this.cards.update(cards =>
      cards.map(card => card.title === title ? { ...card, value } : card)
    );
  }

  getWelcomeGradient(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMIN': return 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)';
      case 'COORDENADOR': return 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)';
      case 'PROFESSOR': return 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)';
      case 'ALUNO': return 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)';
      default: return 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)';
    }
  }

  getWelcomeMessage(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMIN': return 'Gerencie todas as escolas e recursos do sistema.';
      case 'COORDENADOR': return 'Acompanhe o desempenho da sua escola.';
      case 'PROFESSOR': return 'Gerencie suas turmas, avaliações e notas.';
      case 'ALUNO': return 'Acompanhe seu desempenho escolar.';
      default: return 'Bem-vindo ao SIGEA!';
    }
  }

  getRoleIcon(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMIN': return 'admin_panel_settings';
      case 'COORDENADOR': return 'supervisor_account';
      case 'PROFESSOR': return 'school';
      case 'ALUNO': return 'face';
      default: return 'person';
    }
  }

  getRoleColor(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMIN': return '#1976d2';
      case 'COORDENADOR': return '#388e3c';
      case 'PROFESSOR': return '#f57c00';
      case 'ALUNO': return '#7b1fa2';
      default: return '#1976d2';
    }
  }

  getRoleLabel(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'COORDENADOR': return 'Coordenador';
      case 'PROFESSOR': return 'Professor';
      case 'ALUNO': return 'Aluno';
      default: return role || '';
    }
  }

  getInfoTitle(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'ADMIN': return 'Painel do Administrador';
      case 'COORDENADOR': return 'Painel do Coordenador';
      case 'PROFESSOR': return 'Painel do Professor';
      case 'ALUNO': return 'Painel do Aluno';
      default: return 'Sobre o SIGEA';
    }
  }
}
