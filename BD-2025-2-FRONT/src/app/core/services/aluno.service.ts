/**
 * ============================================
 * SIGEA Frontend - Aluno Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Aluno, AlunoInput, ApiResponse, Nota } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AlunoService extends BaseApiService<Aluno, AlunoInput> {
  protected endpoint = 'alunos';

  constructor(http: HttpClient) {
    super(http);
  }

  // Buscar aluno por matrícula
  findByMatricula(matricula: string): Observable<ApiResponse<Aluno>> {
    return this.http.get<ApiResponse<Aluno>>(`${this.fullUrl}/matricula/${matricula}`);
  }

  // Buscar notas do aluno
  findNotas(id: number): Observable<ApiResponse<Nota[]>> {
    return this.http.get<ApiResponse<Nota[]>>(`${this.fullUrl}/${id}/notas`);
  }
}
