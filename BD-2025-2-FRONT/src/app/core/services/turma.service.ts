/**
 * ============================================
 * SIGEA Frontend - Turma Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Turma, TurmaInput, ApiResponse, Aluno } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TurmaService extends BaseApiService<Turma, TurmaInput> {
  protected endpoint = 'turmas';

  constructor(http: HttpClient) {
    super(http);
  }

  // Buscar alunos da turma
  findAlunos(id: number): Observable<ApiResponse<Aluno[]>> {
    return this.http.get<ApiResponse<Aluno[]>>(`${this.fullUrl}/${id}/alunos`);
  }
}
