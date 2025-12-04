/**
 * ============================================
 * SIGEA Frontend - Escolas List Component
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
import { EscolaService } from '../../../core/services';
import { Escola, PaginationMeta } from '../../../core/models';
import { EscolaFormDialogComponent } from '../escola-form-dialog/escola-form-dialog.component';

@Component({
  selector: 'app-escolas-list',
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
  templateUrl: './escolas-list.html',
  styleUrl: './escolas-list.scss',
})
export class EscolasList implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['nome', 'cnpj', 'email', 'telefone', 'regiaoAdministrativa', 'actions'];
  dataSource = new MatTableDataSource<Escola>([]);
  
  loading = signal(true);
  searchTerm = '';
  meta = signal<PaginationMeta | null>(null);

  constructor(
    private escolaService: EscolaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEscolas();
  }

  loadEscolas(page = 1): void {
    this.loading.set(true);
    
    this.escolaService.findAll({
      page,
      limit: 10,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.meta.set(response.meta || null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Erro ao carregar escolas', 'OK', { duration: 3000 });
      }
    });
  }

  onSearch(): void {
    this.loadEscolas(1);
  }

  onPageChange(event: PageEvent): void {
    this.loadEscolas(event.pageIndex + 1);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(EscolaFormDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEscolas();
        this.snackBar.open('Escola criada com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  openEditDialog(escola: Escola): void {
    const dialogRef = this.dialog.open(EscolaFormDialogComponent, {
      width: '500px',
      disableClose: true,
      data: escola
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEscolas();
        this.snackBar.open('Escola atualizada com sucesso!', 'OK', { duration: 3000 });
      }
    });
  }

  confirmDelete(escola: Escola): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Deseja realmente excluir a escola "${escola.nome}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteEscola(escola.id);
      }
    });
  }

  private deleteEscola(id: number): void {
    this.escolaService.delete(id).subscribe({
      next: () => {
        this.loadEscolas();
        this.snackBar.open('Escola excluída com sucesso!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        const message = err.error?.message || 'Erro ao excluir escola';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      }
    });
  }

  formatCNPJ(cnpj: string | null | undefined): string {
    if (!cnpj) return '-';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
}
