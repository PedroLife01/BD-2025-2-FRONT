/**
 * ============================================
 * SIGEA Frontend - Main Layout Component
 * ============================================
 */

import { Component, signal, computed, ViewChild, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidenav"
      >
        <div class="sidenav-header">
          <div class="logo">
            <mat-icon class="logo-icon">school</mat-icon>
            <span class="logo-text">SIGEA</span>
          </div>
          <span class="subtitle">Sistema de Gestão Escolar</span>
        </div>

        <mat-divider></mat-divider>

        <mat-nav-list class="nav-list">
          @for (item of filteredNavItems(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/' }"
              (click)="isMobile() && sidenav.close()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" matTooltip="Menu">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="toolbar-spacer"></span>

          <span class="page-title">{{ pageTitle() }}</span>

          <span class="toolbar-spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="userMenu" matTooltip="Usuário">
            <mat-icon>account_circle</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <mat-icon>person</mat-icon>
              <div>
                <strong>{{ authService.currentUser()?.nome }}</strong>
                <small>{{ authService.currentUser()?.email }}</small>
                <small class="role-badge">{{ authService.currentUser()?.role }}</small>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sair</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: linear-gradient(180deg, #1976d2 0%, #1565c0 100%);
    }

    .sidenav-header {
      padding: 24px 16px;
      text-align: center;
      color: white;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .logo-text {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .subtitle {
      font-size: 11px;
      opacity: 0.85;
    }

    mat-divider {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .nav-list {
      padding: 8px;
    }

    .nav-list a {
      border-radius: 8px;
      margin-bottom: 4px;
      color: rgba(255, 255, 255, 0.9);
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      &.active {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        font-weight: 500;
      }

      mat-icon {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .toolbar-spacer {
      flex: 1;
    }

    .page-title {
      font-size: 18px;
      font-weight: 500;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .user-menu-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 200px;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #1976d2;
      }

      div {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 14px;
        }

        small {
          font-size: 12px;
          color: #666;
        }

        .role-badge {
          margin-top: 4px;
          padding: 2px 8px;
          background: #e3f2fd;
          border-radius: 12px;
          color: #1976d2;
          font-weight: 500;
          font-size: 10px;
          text-transform: uppercase;
        }
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }

      .page-title {
        display: none;
      }
    }
  `]
})
export class MainLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  pageTitle = signal('Dashboard');

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    { label: 'Escolas', icon: 'business', route: '/escolas', roles: ['ADMIN'] },
    { label: 'Turmas', icon: 'groups', route: '/turmas', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR'] },
    { label: 'Alunos', icon: 'school', route: '/alunos', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR'] },
    { label: 'Professores', icon: 'person', route: '/professores', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Disciplinas', icon: 'menu_book', route: '/disciplinas', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Coordenadores', icon: 'supervisor_account', route: '/coordenadores', roles: ['ADMIN'] },
    { label: 'Períodos Letivos', icon: 'calendar_month', route: '/periodos', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Vínculos', icon: 'link', route: '/vinculos', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Avaliações', icon: 'assignment', route: '/avaliacoes', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR'] },
    { label: 'Notas', icon: 'grade', route: '/notas', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR'] },
    { label: 'Regras', icon: 'rule', route: '/regras', roles: ['ADMIN', 'COORDENADOR'] },
    { label: 'Meu Boletim', icon: 'description', route: '/relatorios/boletim', roles: ['ALUNO'] },
    { label: 'Boletins', icon: 'description', route: '/relatorios/boletim', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR'] },
    { label: 'Relatório Turma', icon: 'assessment', route: '/relatorios/turma', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR'] },
    { label: 'Estatísticas Escola', icon: 'bar_chart', route: '/relatorios/escola', roles: ['ADMIN', 'COORDENADOR'] },
  ];

  private breakpointObserver = inject(BreakpointObserver);
  authService = inject(AuthService);

  private isMobileSignal = toSignal(
    this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  isMobile = computed(() => this.isMobileSignal());

  filteredNavItems = computed(() => {
    const user = this.authService.currentUser();
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      return user && item.roles.includes(user.role);
    });
  });

  logout(): void {
    this.authService.logout();
  }
}
