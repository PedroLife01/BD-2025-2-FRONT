import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes (public)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  // Protected routes (with layout)
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Dashboard
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Escolas
      {
        path: 'escolas',
        loadComponent: () => import('./features/escolas/escolas-list/escolas-list').then(m => m.EscolasList)
      },
      // Turmas
      {
        path: 'turmas',
        loadComponent: () => import('./features/turmas/turmas-list/turmas-list.component').then(m => m.TurmasListComponent)
      },
      // Alunos
      {
        path: 'alunos',
        loadComponent: () => import('./features/alunos/alunos-list/alunos-list.component').then(m => m.AlunosListComponent)
      },
      // Professores
      {
        path: 'professores',
        loadComponent: () => import('./features/professores/professores-list/professores-list.component').then(m => m.ProfessoresListComponent)
      },
      // Disciplinas
      {
        path: 'disciplinas',
        loadComponent: () => import('./features/disciplinas/disciplinas-list/disciplinas-list.component').then(m => m.DisciplinasListComponent)
      },
      // Coordenadores
      {
        path: 'coordenadores',
        loadComponent: () => import('./features/coordenadores/coordenadores-list/coordenadores-list.component').then(m => m.CoordenadoresListComponent)
      },
      // Períodos
      {
        path: 'periodos',
        loadComponent: () => import('./features/periodos/periodos-list/periodos-list.component').then(m => m.PeriodosListComponent)
      },
      // Vínculos
      {
        path: 'vinculos',
        loadComponent: () => import('./features/vinculos/vinculos-list/vinculos-list.component').then(m => m.VinculosListComponent)
      },
      // Avaliações
      {
        path: 'avaliacoes',
        loadComponent: () => import('./features/avaliacoes/avaliacoes-list/avaliacoes-list.component').then(m => m.AvaliacoesListComponent)
      },
      // Notas
      {
        path: 'notas',
        loadComponent: () => import('./features/notas/notas-list/notas-list.component').then(m => m.NotasListComponent)
      },
      // Regras
      {
        path: 'regras',
        loadComponent: () => import('./features/regras/regras-list/regras-list.component').then(m => m.RegrasListComponent)
      },
      // Relatórios
      {
        path: 'relatorios',
        loadChildren: () => import('./features/relatorios/relatorios.routes').then(m => m.RELATORIOS_ROUTES)
      },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
