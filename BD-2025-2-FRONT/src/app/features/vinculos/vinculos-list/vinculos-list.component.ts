/**
 * ============================================
 * SIGEA Frontend - Vínculos List Component
 * ============================================
 * TurmaProfessor: id_turma_professor, id_turma, id_professor, id_disciplina
 * Não tem: periodoLetivo, ativo
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

import { VinculoService } from '../../../core/services';
import { TurmaProfessor } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { VinculoFormDialogComponent } from '../vinculo-form-dialog/vinculo-form-dialog.component';

@Component({
  selector: 'app-vinculos-list',
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
        title="Vínculos Turma-Professor" 
        subtitle="Gerenciamento de alocações de professores em turmas"
        actionLabel="Novo Vínculo"
        actionIcon="link"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar vínculos</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Professor, turma ou disciplina...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando vínculos..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="link_off"
            title="Nenhum vínculo cadastrado"
            message="Vincule professores às turmas e disciplinas"
            actionLabel="Criar Vínculo"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="professor">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Professor</th>
                <td mat-cell *matCellDef="let row">
                  <div class="entity-info">
                    <mat-icon class="icon-professor">school</mat-icon>
                    <span>{{ row.professor?.nome || '-' }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="turma">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Turma</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip class="turma-chip">{{ row.turma?.nome || '-' }} ({{ row.turma?.anoLetivo || '-' }})</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="disciplina">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Disciplina</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip class="disciplina-chip">{{ row.disciplina?.nome || '-' }}</mat-chip>
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
    .entity-info { display: flex; align-items: center; gap: 8px; }
    .icon-professor { color: #7b1fa2; font-size: 20px; width: 20px; height: 20px; }
    .turma-chip { background-color: #e8f5e9 !important; color: #388e3c !important; }
    .disciplina-chip { background-color: #fff3e0 !important; color: #e65100 !important; }
  `]
})
export class VinculosListComponent implements OnInit, AfterViewInit {
  private vinculoService = inject(VinculoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['professor', 'turma', 'disciplina', 'actions'];
  dataSource = new MatTableDataSource<TurmaProfessor>();
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
    this.dataSource.filterPredicate = (data: TurmaProfessor, filter: string) => {
      const searchStr = [
        data.professor?.nome,
        data.turma?.nome,
        data.disciplina?.nome
      ].join(' ').toLowerCase();
      return searchStr.includes(filter);
    };
  }

  loadData(): void {
    this.loading.set(true);
    this.vinculoService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar vínculos', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(vinculo?: TurmaProfessor): void {
    const dialogRef = this.dialog.open(VinculoFormDialogComponent, {
      width: '600px', data: vinculo
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(vinculo: TurmaProfessor): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Vínculo', message: 'Deseja excluir este vínculo?', confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(vinculo.id); });
  }

  delete(id: number): void {
    this.vinculoService.delete(id).subscribe({
      next: () => { this.snackBar.open('Vínculo excluído', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }
}
