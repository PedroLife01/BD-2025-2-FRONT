/**
 * ============================================
 * SIGEA Frontend - Vínculo (Turma-Professor) Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { TurmaProfessor, TurmaProfessorInput, ApiResponse, PaginationParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VinculoService extends BaseApiService<TurmaProfessor, TurmaProfessorInput> {
  protected endpoint = 'vinculos';

  constructor(http: HttpClient) {
    super(http);
  }

  // Buscar vínculos por professor
  findByProfessor(idProfessor: number, params?: PaginationParams): Observable<ApiResponse<TurmaProfessor[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<ApiResponse<TurmaProfessor[]>>(
      `${this.fullUrl}/professor/${idProfessor}`,
      { params: httpParams }
    );
  }

  // Buscar vínculos por turma
  findByTurma(idTurma: number, params?: PaginationParams): Observable<ApiResponse<TurmaProfessor[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<ApiResponse<TurmaProfessor[]>>(
      `${this.fullUrl}/turma/${idTurma}`,
      { params: httpParams }
    );
  }
}
