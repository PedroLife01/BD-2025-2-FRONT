/**
 * ============================================
 * SIGEA Frontend - Turmas List Component
 * ============================================
 */

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { TurmaService } from '../../../core/services';
import { Turma, PaginationMeta } from '../../../core/models';
import { TurmaFormDialogComponent } from '../turma-form-dialog/turma-form-dialog.component';

@Component({
  selector: 'app-turmas-list',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-page-header
      title="Turmas"
      subtitle="Gerencie as turmas das escolas"
      icon="groups"
      [showAddButton]="true"
      addButtonLabel="Nova Turma"
      (addClick)="openCreateDialog()"
    ></app-page-header>

    <mat-card class="table-card">
      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar turmas</mat-label>
          <input matInput [(ngModel)]="searchTerm" (keyup.enter)="onSearch()" placeholder="Nome, série...">
          <button mat-icon-button matSuffix (click)="onSearch()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
      </div>

      @if (loading()) {
        <app-loading message="Carregando turmas..."></app-loading>
      }

      @if (!loading() && dataSource.data.length === 0) {
        <app-empty-state
          icon="groups"
          title="Nenhuma turma encontrada"
          [message]="searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando a primeira turma'"
          [actionLabel]="searchTerm ? '' : 'Nova Turma'"
          (action)="openCreateDialog()"
        ></app-empty-state>
      }

      @if (!loading() && dataSource.data.length > 0) {
        <div class="table-container">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Turma</th>
              <td mat-cell *matCellDef="let turma">
                <div class="item-name">
                  <mat-icon class="item-icon">groups</mat-icon>
                  <span>{{ turma.nome }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="escola">
              <th mat-header-cell *matHeaderCellDef>Escola</th>
              <td mat-cell *matCellDef="let turma">{{ turma.escola?.nome || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="serie">
              <th mat-header-cell *matHeaderCellDef>Série</th>
              <td mat-cell *matCellDef="let turma">{{ turma.serie || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="anoLetivo">
              <th mat-header-cell *matHeaderCellDef>Ano Letivo</th>
              <td mat-cell *matCellDef="let turma">
                <mat-chip-set>
                  <mat-chip>{{ turma.anoLetivo }}</mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="turno">
              <th mat-header-cell *matHeaderCellDef>Turno</th>
              <td mat-cell *matCellDef="let turma">{{ turma.turno || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
              <td mat-cell *matCellDef="let turma" class="actions-cell">
                <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Opções">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openEditDialog(turma)">
                    <mat-icon>edit</mat-icon>
                    <span>Editar</span>
                  </button>
                  <button mat-menu-item (click)="confirmDelete(turma)">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Excluir</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        @if (meta()) {
          <mat-paginator
            [length]="meta()!.total"
            [pageSize]="meta()!.limit"
            [pageIndex]="meta()!.page - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons
          ></mat-paginator>
        }
      }
    </mat-card>
  `,
  styles: [`
    .table-card { border-radius: 12px; overflow: hidden; }
    .search-bar { padding: 16px 16px 0; }
    .search-field { width: 100%; max-width: 400px; }
    .table-container { overflow-x: auto; }
    table { width: 100%; }
    .item-name { display: flex; align-items: center; gap: 12px; }
    .item-icon { color: #388e3c; background: #e8f5e9; border-radius: 8px; padding: 8px; }
    .actions-header, .actions-cell { text-align: center; width: 80px; }
    mat-paginator { border-top: 1px solid #eee; }
    tr.mat-mdc-row:hover { background: #f8f9fa; }
  `]
})
export class TurmasListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['nome', 'escola', 'serie', 'anoLetivo', 'turno', 'actions'];
  dataSource = new MatTableDataSource<Turma>([]);
  
  loading = signal(true);
  searchTerm = '';
  meta = signal<PaginationMeta | null>(null);

  constructor(
    private turmaService: TurmaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTurmas();
  }

  loadTurmas(page = 1): void {
    this.loading.set(true);
    this.turmaService.findAll({ page, limit: 10, search: this.searchTerm }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.meta.set(response.meta || null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar turmas', 'OK', { duration: 3000 });
      }
    });
  }

  onSearch(): void { this.loadTurmas(1); }
  onPageChange(event: PageEvent): void { this.loadTurmas(event.pageIndex + 1); }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TurmaFormDialogComponent, { width: '500px', disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTurmas();
        this.snackBar.open('Turma criada com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  openEditDialog(turma: Turma): void {
    const dialogRef = this.dialog.open(TurmaFormDialogComponent, { width: '500px', disableClose: true, data: turma });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTurmas();
        this.snackBar.open('Turma atualizada com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  confirmDelete(turma: Turma): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Confirmar Exclusão', message: `Deseja excluir a turma "${turma.nome}"?`, confirmText: 'Excluir', type: 'danger' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.turmaService.delete(turma.id).subscribe({
          next: () => { this.loadTurmas(); this.snackBar.open('Turma excluída!', 'OK', { duration: 3000 }); },
          error: (err) => this.snackBar.open(err.error?.message || 'Erro ao excluir', 'OK', { duration: 5000 })
        });
      }
    });
  }
}
