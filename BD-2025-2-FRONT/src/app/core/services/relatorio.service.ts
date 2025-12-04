/**
 * ============================================
 * SIGEA Frontend - Serviço de Relatórios
 * ============================================
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  BoletimAluno, 
  RelatorioTurma, 
  EstatisticasEscola 
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/relatorios`;

  /**
   * Obtém o boletim do aluno logado
   */
  getMeuBoletim(): Observable<ApiResponse<BoletimAluno>> {
    return this.http.get<ApiResponse<BoletimAluno>>(`${this.baseUrl}/meu-boletim`);
  }

  /**
   * Obtém o boletim de um aluno específico
   */
  getBoletimAluno(idAluno: number): Observable<ApiResponse<BoletimAluno>> {
    return this.http.get<ApiResponse<BoletimAluno>>(`${this.baseUrl}/alunos/${idAluno}`);
  }

  /**
   * Obtém relatório de uma turma
   */
  getRelatorioTurma(idTurma: number): Observable<ApiResponse<RelatorioTurma>> {
    return this.http.get<ApiResponse<RelatorioTurma>>(`${this.baseUrl}/turmas/${idTurma}`);
  }

  /**
   * Obtém estatísticas da escola do usuário logado
   */
  getMinhaEscola(): Observable<ApiResponse<EstatisticasEscola>> {
    return this.http.get<ApiResponse<EstatisticasEscola>>(`${this.baseUrl}/minha-escola`);
  }

  /**
   * Obtém estatísticas de uma escola específica
   */
  getEstatisticasEscola(idEscola: number): Observable<ApiResponse<EstatisticasEscola>> {
    return this.http.get<ApiResponse<EstatisticasEscola>>(`${this.baseUrl}/escolas/${idEscola}`);
  }
}
