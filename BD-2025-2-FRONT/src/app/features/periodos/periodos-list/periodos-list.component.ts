/**
 * ============================================
 * SIGEA Frontend - Períodos Letivos List Component
 * ============================================
 */

import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { PeriodoLetivoService } from '../../../core/services';
import { PeriodoLetivo } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { PeriodoFormDialogComponent } from '../periodo-form-dialog/periodo-form-dialog.component';

@Component({
  selector: 'app-periodos-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatChipsModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      <app-page-header 
        title="Períodos Letivos" 
        subtitle="Gerenciamento de períodos e bimestres"
        actionLabel="Novo Período"
        actionIcon="date_range"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar períodos</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nome ou tipo...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando períodos..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="date_range"
            title="Nenhum período cadastrado"
            message="Comece cadastrando o primeiro período letivo"
            actionLabel="Cadastrar Período"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="ano">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Ano</th>
                <td mat-cell *matCellDef="let row">{{ row.ano }}</td>
              </ng-container>

              <ng-container matColumnDef="etapa">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Etapa</th>
                <td mat-cell *matCellDef="let row">
                  <div class="periodo-info">
                    <mat-icon class="periodo-icon">date_range</mat-icon>
                    <span>{{ row.etapa }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="dataInicio">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Data Início</th>
                <td mat-cell *matCellDef="let row">{{ row.dataInicio | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="dataFim">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Data Fim</th>
                <td mat-cell *matCellDef="let row">{{ row.dataFim | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button matTooltip="Editar" (click)="openDialog(row)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Excluir" (click)="confirmDelete(row)">
                    <mat-icon color="warn">delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <mat-paginator 
            [pageSizeOptions]="[10, 25, 50]" 
            showFirstLastButtons
            aria-label="Selecione a página">
          </mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/list-page' as *;
    .periodo-info { display: flex; align-items: center; gap: 8px; }
    .periodo-icon { color: #5c6bc0; font-size: 20px; width: 20px; height: 20px; }
    .tipo-bimestre { background-color: #e8eaf6 !important; color: #3949ab !important; }
    .tipo-semestre { background-color: #fce4ec !important; color: #c2185b !important; }
    .tipo-ano { background-color: #fff3e0 !important; color: #e65100 !important; }
    .status-ativo { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-inativo { background-color: #ffebee !important; color: #c62828 !important; }
  `]
})
export class PeriodosListComponent implements OnInit, AfterViewInit {
  private periodoService = inject(PeriodoLetivoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['ano', 'etapa', 'dataInicio', 'dataFim', 'actions'];
  dataSource = new MatTableDataSource<PeriodoLetivo>();
  searchControl = new FormControl('');
  loading = signal(true);

  ngOnInit(): void {
    this.loadData();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => this.dataSource.filter = value?.trim().toLowerCase() || '');
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.loading.set(true);
    this.periodoService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar períodos', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(periodo?: PeriodoLetivo): void {
    const dialogRef = this.dialog.open(PeriodoFormDialogComponent, {
      width: '500px', data: periodo
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(periodo: PeriodoLetivo): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Período', message: `Deseja excluir "${periodo.ano} - ${periodo.etapa}"?`, confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(periodo.id); });
  }

  delete(id: number): void {
    this.periodoService.delete(id).subscribe({
      next: () => { this.snackBar.open('Período excluído', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }

  getTipoClass(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'bimestre': return 'tipo-bimestre';
      case 'semestre': return 'tipo-semestre';
      case 'ano': return 'tipo-ano';
      default: return '';
    }
  }
}
