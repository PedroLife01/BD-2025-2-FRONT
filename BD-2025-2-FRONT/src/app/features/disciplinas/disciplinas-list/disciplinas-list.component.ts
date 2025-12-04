/**
 * ============================================
 * SIGEA Frontend - Disciplinas List Component
 * ============================================
 */

import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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

import { DisciplinaService } from '../../../core/services';
import { Disciplina } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { DisciplinaFormDialogComponent } from '../disciplina-form-dialog/disciplina-form-dialog.component';

@Component({
  selector: 'app-disciplinas-list',
  standalone: true,
  imports: [
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
        title="Disciplinas" 
        subtitle="Gerenciamento de disciplinas acadêmicas"
        actionLabel="Nova Disciplina"
        actionIcon="menu_book"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar disciplinas</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nome ou código...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando disciplinas..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="menu_book"
            title="Nenhuma disciplina cadastrada"
            message="Comece cadastrando a primeira disciplina"
            actionLabel="Cadastrar Disciplina"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Código</th>
                <td mat-cell *matCellDef="let row">
                  <span class="codigo-badge">{{ row.codigo || '-' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
                <td mat-cell *matCellDef="let row">
                  <div class="disciplina-info">
                    <mat-icon class="disciplina-icon">menu_book</mat-icon>
                    <span>{{ row.nome }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="cargaHoraria">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Carga Horária</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.cargaHoraria) {
                    <mat-chip class="carga-chip">{{ row.cargaHoraria }}h</mat-chip>
                  } @else {
                    -
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let row">
                  <span class="descricao-text">{{ row.descricao || '-' }}</span>
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
    .codigo-badge { background: #fff3e0; color: #e65100; padding: 4px 8px; border-radius: 4px; font-weight: 500; font-family: monospace; }
    .disciplina-info { display: flex; align-items: center; gap: 8px; }
    .disciplina-icon { color: #ff9800; font-size: 20px; width: 20px; height: 20px; }
    .carga-chip { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .descricao-text { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
  `]
})
export class DisciplinasListComponent implements OnInit, AfterViewInit {
  private disciplinaService = inject(DisciplinaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['nome', 'cargaHoraria', 'actions'];
  dataSource = new MatTableDataSource<Disciplina>();
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
    this.disciplinaService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar disciplinas', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(disciplina?: Disciplina): void {
    const dialogRef = this.dialog.open(DisciplinaFormDialogComponent, {
      width: '500px', data: disciplina
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(disciplina: Disciplina): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Disciplina', message: `Deseja excluir "${disciplina.nome}"?`, confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(disciplina.id); });
  }

  delete(id: number): void {
    this.disciplinaService.delete(id).subscribe({
      next: () => { this.snackBar.open('Disciplina excluída', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }
}
