/**
 * ============================================
 * SIGEA Frontend - Rotas do módulo de Relatórios
 * ============================================
 */

import { Routes } from '@angular/router';

export const RELATORIOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'boletim',
    pathMatch: 'full',
  },
  {
    path: 'boletim',
    loadComponent: () =>
      import('./boletim/boletim.component').then((m) => m.BoletimComponent),
    title: 'Boletim - SIGEA',
  },
  {
    path: 'turma',
    loadComponent: () =>
      import('./relatorio-turma/relatorio-turma.component').then(
        (m) => m.RelatorioTurmaComponent
      ),
    title: 'Relatório de Turma - SIGEA',
  },
  {
    path: 'escola',
    loadComponent: () =>
      import('./estatisticas-escola/estatisticas-escola.component').then(
        (m) => m.EstatisticasEscolaComponent
      ),
    title: 'Estatísticas da Escola - SIGEA',
  },
];
