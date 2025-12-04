/**
 * ============================================
 * SIGEA Frontend - Notas List Component
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

import { NotaService } from '../../../core/services';
import { Nota } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { NotaFormDialogComponent } from '../nota-form-dialog/nota-form-dialog.component';

@Component({
  selector: 'app-notas-list',
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
        title="Notas" 
        subtitle="Gerenciamento de notas dos alunos"
        actionLabel="Lançar Nota"
        actionIcon="grade"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar notas</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Aluno ou avaliação...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando notas..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="grade"
            title="Nenhuma nota lançada"
            message="Comece lançando as primeiras notas"
            actionLabel="Lançar Nota"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="aluno">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Aluno</th>
                <td mat-cell *matCellDef="let row">
                  <div class="aluno-info">
                    <mat-icon class="aluno-icon">person</mat-icon>
                    <span>{{ row.aluno?.nome || '-' }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="matricula">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Matrícula</th>
                <td mat-cell *matCellDef="let row">
                  <span class="matricula-badge">{{ row.aluno?.matricula || '-' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="avaliacao">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Avaliação</th>
                <td mat-cell *matCellDef="let row">{{ row.avaliacao?.titulo || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="notaObtida">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nota</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [class]="getNotaClass(row.notaObtida)">
                    {{ row.notaObtida | number:'1.1-1' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="dataLancamento">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Data Lançamento</th>
                <td mat-cell *matCellDef="let row">{{ row.dataLancamento | date:'dd/MM/yyyy HH:mm' }}</td>
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
    .aluno-info { display: flex; align-items: center; gap: 8px; }
    .aluno-icon { color: #1976d2; font-size: 20px; width: 20px; height: 20px; }
    .matricula-badge { background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
    .nota-alta { background-color: #e8f5e9 !important; color: #2e7d32 !important; font-weight: bold; }
    .nota-media { background-color: #fff3e0 !important; color: #e65100 !important; font-weight: bold; }
    .nota-baixa { background-color: #ffebee !important; color: #c62828 !important; font-weight: bold; }
  `]
})
export class NotasListComponent implements OnInit, AfterViewInit {
  private notaService = inject(NotaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['aluno', 'matricula', 'avaliacao', 'notaObtida', 'dataLancamento', 'actions'];
  dataSource = new MatTableDataSource<Nota>();
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
    this.dataSource.filterPredicate = (data: Nota, filter: string) => {
      const searchStr = [
        data.aluno?.nome,
        data.aluno?.matricula,
        data.avaliacao?.titulo
      ].join(' ').toLowerCase();
      return searchStr.includes(filter);
    };
  }

  loadData(): void {
    this.loading.set(true);
    this.notaService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar notas', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(nota?: Nota): void {
    const dialogRef = this.dialog.open(NotaFormDialogComponent, {
      width: '500px', data: nota
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(nota: Nota): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Nota', message: 'Deseja excluir esta nota?', confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(nota.id); });
  }

  delete(id: number): void {
    this.notaService.delete(id).subscribe({
      next: () => { this.snackBar.open('Nota excluída', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }

  getNotaClass(notaObtida: number): string {
    if (notaObtida >= 7) return 'nota-alta';
    if (notaObtida >= 5) return 'nota-media';
    return 'nota-baixa';
  }
}
