import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'escolas',
    loadComponent: () =>
      import('./features/escolas/escolas-list/escolas-list')
        .then(m => m.EscolasList)
  },
  { path: '', redirectTo: '/escolas', pathMatch: 'full' }
];
