/**
 * ============================================
 * SIGEA Frontend - Nota Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Nota, NotaInput, NotasBatchInput, ApiResponse, PaginationParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotaService extends BaseApiService<Nota, NotaInput> {
  protected endpoint = 'notas';

  constructor(http: HttpClient) {
    super(http);
  }

  // Buscar notas por avaliação
  findByAvaliacao(idAvaliacao: number, params?: PaginationParams): Observable<ApiResponse<Nota[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<ApiResponse<Nota[]>>(
      `${this.fullUrl}/avaliacao/${idAvaliacao}`,
      { params: httpParams }
    );
  }

  // Buscar notas por aluno
  findByAluno(idAluno: number, params?: PaginationParams): Observable<ApiResponse<Nota[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<ApiResponse<Nota[]>>(
      `${this.fullUrl}/aluno/${idAluno}`,
      { params: httpParams }
    );
  }

  // Lançar notas em lote
  createBatch(data: NotasBatchInput): Observable<ApiResponse<Nota[]>> {
    return this.http.post<ApiResponse<Nota[]>>(`${this.fullUrl}/batch`, data);
  }
}
