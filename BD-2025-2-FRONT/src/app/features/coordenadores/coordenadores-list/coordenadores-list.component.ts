/**
 * ============================================
 * SIGEA Frontend - Coordenadores List Component
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

import { CoordenadorService } from '../../../core/services';
import { Coordenador } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { CoordenadorFormDialogComponent } from '../coordenador-form-dialog/coordenador-form-dialog.component';

@Component({
  selector: 'app-coordenadores-list',
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
        title="Coordenadores" 
        subtitle="Gerenciamento de coordenadores escolares"
        actionLabel="Novo Coordenador"
        actionIcon="supervisor_account"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar coordenadores</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nome, CPF ou email...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando coordenadores..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="supervisor_account"
            title="Nenhum coordenador cadastrado"
            message="Comece cadastrando o primeiro coordenador"
            actionLabel="Cadastrar Coordenador"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
                <td mat-cell *matCellDef="let row">
                  <div class="coordenador-info">
                    <mat-icon class="coordenador-icon">supervisor_account</mat-icon>
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

              <ng-container matColumnDef="escola">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Escola</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.escola) {
                    <mat-chip class="escola-chip">{{ row.escola.nome }}</mat-chip>
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
    .coordenador-info { display: flex; align-items: center; gap: 8px; }
    .coordenador-icon { color: #00796b; font-size: 20px; width: 20px; height: 20px; }
    .escola-chip { background-color: #e0f2f1 !important; color: #00796b !important; }
    .status-ativo { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-inativo { background-color: #ffebee !important; color: #c62828 !important; }
  `]
})
export class CoordenadoresListComponent implements OnInit, AfterViewInit {
  private coordenadorService = inject(CoordenadorService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['nome', 'cpf', 'email', 'telefone', 'escola', 'status', 'actions'];
  dataSource = new MatTableDataSource<Coordenador>();
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
    this.coordenadorService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar coordenadores', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(coordenador?: Coordenador): void {
    const dialogRef = this.dialog.open(CoordenadorFormDialogComponent, {
      width: '600px', data: coordenador
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(coordenador: Coordenador): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Coordenador', message: `Deseja excluir "${coordenador.nome}"?`, confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(coordenador.id); });
  }

  delete(id: number): void {
    this.coordenadorService.delete(id).subscribe({
      next: () => { this.snackBar.open('Coordenador excluído', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }
}
