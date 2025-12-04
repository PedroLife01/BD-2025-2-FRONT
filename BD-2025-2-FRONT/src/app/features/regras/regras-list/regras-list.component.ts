/**
 * ============================================
 * SIGEA Frontend - Regras de Aprovação List Component
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

import { RegraAprovacaoService } from '../../../core/services';
import { RegraAprovacao } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { RegraFormDialogComponent } from '../regra-form-dialog/regra-form-dialog.component';

@Component({
  selector: 'app-regras-list',
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
        title="Regras de Aprovação" 
        subtitle="Configuração de critérios de aprovação"
        actionLabel="Nova Regra"
        actionIcon="rule"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar regras</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nome ou escola...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando regras..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="rule"
            title="Nenhuma regra cadastrada"
            message="Configure as regras de aprovação do sistema"
            actionLabel="Criar Regra"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
                <td mat-cell *matCellDef="let row">
                  <div class="regra-info">
                    <mat-icon class="regra-icon">rule</mat-icon>
                    <span>{{ row.nome }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="escola">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Escola</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.escola) {
                    <mat-chip class="escola-chip">{{ row.escola.nome }}</mat-chip>
                  } @else {
                    <mat-chip class="global-chip">Global</mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="mediaMinima">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Média Mínima</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip class="media-chip">{{ row.mediaMinima | number:'1.1-1' }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="frequenciaMinima">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Frequência Mínima</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip class="frequencia-chip">{{ row.frequenciaMinima | number:'1.0-0' }}%</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [class]="row.ativo ? 'status-ativo' : 'status-inativo'">
                    {{ row.ativo ? 'Ativa' : 'Inativa' }}
                  </mat-chip>
                </td>
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
    .regra-info { display: flex; align-items: center; gap: 8px; }
    .regra-icon { color: #673ab7; font-size: 20px; width: 20px; height: 20px; }
    .escola-chip { background-color: #e0f2f1 !important; color: #00796b !important; }
    .global-chip { background-color: #ede7f6 !important; color: #512da8 !important; }
    .media-chip { background-color: #e8f5e9 !important; color: #2e7d32 !important; font-weight: bold; }
    .frequencia-chip { background-color: #e3f2fd !important; color: #1565c0 !important; font-weight: bold; }
    .status-ativo { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-inativo { background-color: #ffebee !important; color: #c62828 !important; }
  `]
})
export class RegrasListComponent implements OnInit, AfterViewInit {
  private regraService = inject(RegraAprovacaoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['nome', 'escola', 'mediaMinima', 'actions'];
  dataSource = new MatTableDataSource<RegraAprovacao>();
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
    this.regraService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar regras', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(regra?: RegraAprovacao): void {
    const dialogRef = this.dialog.open(RegraFormDialogComponent, {
      width: '500px', data: regra
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(regra: RegraAprovacao): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Regra', message: `Deseja excluir a regra do ano ${regra.anoLetivo}?`, confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(regra.id); });
  }

  delete(id: number): void {
    this.regraService.delete(id).subscribe({
      next: () => { this.snackBar.open('Regra excluída', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }
}
