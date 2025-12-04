/**
 * ============================================
 * SIGEA Frontend - Professores List Component
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
import { MatMenuModule } from '@angular/material/menu';

import { ProfessorService } from '../../../core/services';
import { Professor } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { ProfessorFormDialogComponent } from '../professor-form-dialog/professor-form-dialog.component';

@Component({
  selector: 'app-professores-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatChipsModule, MatMenuModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      <app-page-header 
        title="Professores" 
        subtitle="Gerenciamento do corpo docente"
        actionLabel="Novo Professor"
        actionIcon="person_add"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar professores</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nome, CPF ou especialidade...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando professores..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="school"
            title="Nenhum professor cadastrado"
            message="Comece cadastrando o primeiro professor"
            actionLabel="Cadastrar Professor"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
                <td mat-cell *matCellDef="let row">
                  <div class="professor-info">
                    <mat-icon class="professor-icon">school</mat-icon>
                    <span>{{ row.nome }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="cpf">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>CPF</th>
                <td mat-cell *matCellDef="let row">{{ row.cpf || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let row">{{ row.email || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="telefone">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Telefone</th>
                <td mat-cell *matCellDef="let row">{{ row.telefone || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="especialidade">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Especialidade</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.especialidade) {
                    <mat-chip class="especialidade-chip">{{ row.especialidade }}</mat-chip>
                  } @else {
                    -
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [class]="row.ativo ? 'status-ativo' : 'status-inativo'">
                    {{ row.ativo ? 'Ativo' : 'Inativo' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Opções">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openDialog(row)">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item (click)="viewTurmas(row)">
                      <mat-icon>groups</mat-icon>
                      <span>Ver Turmas</span>
                    </button>
                    <button mat-menu-item (click)="confirmDelete(row)" class="delete-action">
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
    .professor-info { display: flex; align-items: center; gap: 8px; }
    .professor-icon { color: #7b1fa2; font-size: 20px; width: 20px; height: 20px; }
    .especialidade-chip { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .status-ativo { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-inativo { background-color: #ffebee !important; color: #c62828 !important; }
    .delete-action { color: #f44336; }
  `]
})
export class ProfessoresListComponent implements OnInit, AfterViewInit {
  private professorService = inject(ProfessorService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['nome', 'email', 'telefone', 'actions'];
  dataSource = new MatTableDataSource<Professor>();
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
    this.professorService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar professores', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(professor?: Professor): void {
    const dialogRef = this.dialog.open(ProfessorFormDialogComponent, {
      width: '600px', data: professor
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(professor: Professor): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Professor', message: `Deseja excluir "${professor.nome}"?`, confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(professor.id); });
  }

  delete(id: number): void {
    this.professorService.delete(id).subscribe({
      next: () => { this.snackBar.open('Professor excluído', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }

  viewTurmas(professor: Professor): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }
}
