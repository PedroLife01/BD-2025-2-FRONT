/**
 * ============================================
 * SIGEA Frontend - Escola Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Escola, EscolaInput, ApiResponse, Turma, Professor, Coordenador } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EscolaService extends BaseApiService<Escola, EscolaInput> {
  protected endpoint = 'escolas';

  constructor(http: HttpClient) {
    super(http);
  }

  // Buscar turmas da escola
  findTurmas(id: number): Observable<ApiResponse<Turma[]>> {
    return this.http.get<ApiResponse<Turma[]>>(`${this.fullUrl}/${id}/turmas`);
  }

  // Buscar professores da escola
  findProfessores(id: number): Observable<ApiResponse<Professor[]>> {
    return this.http.get<ApiResponse<Professor[]>>(`${this.fullUrl}/${id}/professores`);
  }

  // Buscar coordenadores da escola
  findCoordenadores(id: number): Observable<ApiResponse<Coordenador[]>> {
    return this.http.get<ApiResponse<Coordenador[]>>(`${this.fullUrl}/${id}/coordenadores`);
  }
}
