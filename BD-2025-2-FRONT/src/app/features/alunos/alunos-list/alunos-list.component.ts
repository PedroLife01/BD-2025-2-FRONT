/**
 * ============================================
 * SIGEA Frontend - Alunos List Component
 * ============================================
 */

import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
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

import { AlunoService } from '../../../core/services';
import { Aluno } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { AlunoFormDialogComponent } from '../aluno-form-dialog/aluno-form-dialog.component';

@Component({
  selector: 'app-alunos-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatChipsModule, MatMenuModule,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
    DatePipe
  ],
  template: `
    <div class="page-container">
      <app-page-header 
        title="Alunos" 
        subtitle="Gerenciamento de alunos matriculados"
        actionLabel="Novo Aluno"
        actionIcon="person_add"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar alunos</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nome, matrícula ou CPF...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando alunos..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="person_off"
            title="Nenhum aluno cadastrado"
            message="Comece cadastrando o primeiro aluno do sistema"
            actionLabel="Cadastrar Aluno"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="matricula">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Matrícula</th>
                <td mat-cell *matCellDef="let row">
                  <span class="matricula-badge">{{ row.matricula }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
                <td mat-cell *matCellDef="let row">
                  <div class="aluno-info">
                    <mat-icon class="aluno-icon">person</mat-icon>
                    <span>{{ row.nome }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="cpf">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>CPF</th>
                <td mat-cell *matCellDef="let row">{{ row.cpf || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="dataNascimento">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Data Nascimento</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.dataNascimento ? (row.dataNascimento | date:'dd/MM/yyyy') : '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let row">{{ row.email || '-' }}</td>
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
                    <button mat-menu-item (click)="viewMatriculas(row)">
                      <mat-icon>assignment</mat-icon>
                      <span>Matrículas</span>
                    </button>
                    <button mat-menu-item (click)="viewNotas(row)">
                      <mat-icon>grade</mat-icon>
                      <span>Notas</span>
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
    .matricula-badge { background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-weight: 500; font-family: monospace; }
    .aluno-info { display: flex; align-items: center; gap: 8px; }
    .aluno-icon { color: #1976d2; font-size: 20px; width: 20px; height: 20px; }
    .status-ativo { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-inativo { background-color: #ffebee !important; color: #c62828 !important; }
    .delete-action { color: #f44336; }
  `]
})
export class AlunosListComponent implements OnInit, AfterViewInit {
  private alunoService = inject(AlunoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['matricula', 'nome', 'dataNascimento', 'email', 'actions'];
  dataSource = new MatTableDataSource<Aluno>();
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
    this.alunoService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar alunos', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(aluno?: Aluno): void {
    const dialogRef = this.dialog.open(AlunoFormDialogComponent, {
      width: '600px', data: aluno
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(aluno: Aluno): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Aluno', message: `Deseja excluir "${aluno.nome}"?`, confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(aluno.id); });
  }

  delete(id: number): void {
    this.alunoService.delete(id).subscribe({
      next: () => { this.snackBar.open('Aluno excluído', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }

  viewMatriculas(aluno: Aluno): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  viewNotas(aluno: Aluno): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }
}
