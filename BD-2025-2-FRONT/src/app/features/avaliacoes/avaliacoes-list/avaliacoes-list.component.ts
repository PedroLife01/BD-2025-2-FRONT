/**
 * ============================================
 * SIGEA Frontend - Avaliações List Component
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
import { MatMenuModule } from '@angular/material/menu';

import { AvaliacaoService } from '../../../core/services';
import { Avaliacao } from '../../../core/models';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent, ConfirmDialogComponent } from '../../../shared/components';
import { AvaliacaoFormDialogComponent } from '../avaliacao-form-dialog/avaliacao-form-dialog.component';

@Component({
  selector: 'app-avaliacoes-list',
  standalone: true,
  imports: [
    CommonModule,
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
        title="Avaliações" 
        subtitle="Gerenciamento de avaliações e provas"
        actionLabel="Nova Avaliação"
        actionIcon="assignment"
        (action)="openDialog()">
      </app-page-header>

      <div class="content-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar avaliações</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Nome, tipo ou disciplina...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
        </div>

        @if (loading()) {
          <app-loading message="Carregando avaliações..."></app-loading>
        } @else if (dataSource.data.length === 0) {
          <app-empty-state
            icon="assignment"
            title="Nenhuma avaliação cadastrada"
            message="Comece criando a primeira avaliação"
            actionLabel="Criar Avaliação"
            (action)="openDialog()">
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="titulo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Título</th>
                <td mat-cell *matCellDef="let row">
                  <div class="avaliacao-info">
                    <mat-icon class="avaliacao-icon">assignment</mat-icon>
                    <span>{{ row.titulo }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="tipo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [class]="getTipoClass(row.tipo)">{{ row.tipo || '-' }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="vinculo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Turma/Disciplina</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.turmaProfessor) {
                    <span>{{ row.turmaProfessor.turma?.nome }} - {{ row.turmaProfessor.disciplina?.nome }}</span>
                  } @else {
                    -
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="data">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Data</th>
                <td mat-cell *matCellDef="let row">{{ row.dataAplicacao | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="peso">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Peso</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip class="peso-chip">{{ row.peso || 1 }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="arquivo">
                <th mat-header-cell *matHeaderCellDef>PDF</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.temArquivo) {
                    <button mat-icon-button color="primary" (click)="downloadArquivo(row)" matTooltip="Baixar PDF da prova">
                      <mat-icon>picture_as_pdf</mat-icon>
                    </button>
                  } @else {
                    <mat-icon class="no-file" matTooltip="Sem arquivo">remove_circle_outline</mat-icon>
                  }
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
                    <button mat-menu-item (click)="viewNotas(row)">
                      <mat-icon>grade</mat-icon>
                      <span>Lançar Notas</span>
                    </button>
                    @if (row.temArquivo) {
                      <button mat-menu-item (click)="downloadArquivo(row)">
                        <mat-icon color="primary">picture_as_pdf</mat-icon>
                        <span>Baixar PDF</span>
                      </button>
                    }
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
    .avaliacao-info { display: flex; align-items: center; gap: 8px; }
    .avaliacao-icon { color: #d32f2f; font-size: 20px; width: 20px; height: 20px; }
    .tipo-prova { background-color: #ffebee !important; color: #c62828 !important; }
    .tipo-trabalho { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .tipo-exercicio { background-color: #fff3e0 !important; color: #e65100 !important; }
    .tipo-seminario { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .peso-chip { background-color: #e8f5e9 !important; color: #2e7d32 !important; font-weight: bold; }
    .delete-action { color: #f44336; }
    .no-file { color: #ccc; font-size: 20px; width: 20px; height: 20px; }
  `]
})
export class AvaliacoesListComponent implements OnInit, AfterViewInit {
  private avaliacaoService = inject(AvaliacaoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['titulo', 'tipo', 'vinculo', 'data', 'peso', 'arquivo', 'actions'];
  dataSource = new MatTableDataSource<Avaliacao>();
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
    this.avaliacaoService.findAll({ limit: 100 }).subscribe({
      next: (res) => { this.dataSource.data = res.data; this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar avaliações', 'Fechar', { duration: 3000 }); this.loading.set(false); }
    });
  }

  openDialog(avaliacao?: Avaliacao): void {
    const dialogRef = this.dialog.open(AvaliacaoFormDialogComponent, {
      width: '650px', data: avaliacao
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadData(); });
  }

  confirmDelete(avaliacao: Avaliacao): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Excluir Avaliação', message: `Deseja excluir "${avaliacao.titulo}"?`, confirmText: 'Excluir', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => { if (confirmed) this.delete(avaliacao.id); });
  }

  delete(id: number): void {
    this.avaliacaoService.delete(id).subscribe({
      next: () => { this.snackBar.open('Avaliação excluída', 'Fechar', { duration: 3000 }); this.loadData(); },
      error: () => this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 3000 })
    });
  }

  downloadArquivo(avaliacao: Avaliacao): void {
    this.avaliacaoService.downloadArquivo(avaliacao.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prova_${avaliacao.titulo.replace(/\s+/g, '_')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Download iniciado', 'Fechar', { duration: 2000 });
      },
      error: () => this.snackBar.open('Erro ao baixar arquivo', 'Fechar', { duration: 3000 })
    });
  }

  viewNotas(avaliacao: Avaliacao): void {
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  getTipoClass(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'prova': return 'tipo-prova';
      case 'trabalho': return 'tipo-trabalho';
      case 'exercicio': case 'exercício': return 'tipo-exercicio';
      case 'seminario': case 'seminário': return 'tipo-seminario';
      default: return '';
    }
  }
}
