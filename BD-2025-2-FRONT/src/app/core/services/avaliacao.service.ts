/**
 * ============================================
 * SIGEA Frontend - Avaliação Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Avaliacao, AvaliacaoInput, ApiResponse, PaginationParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AvaliacaoService extends BaseApiService<Avaliacao, AvaliacaoInput> {
  protected endpoint = 'avaliacoes';

  constructor(http: HttpClient) {
    super(http);
  }

  // Buscar avaliações por vínculo
  findByVinculo(idTurmaProfessor: number, params?: PaginationParams): Observable<ApiResponse<Avaliacao[]>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<ApiResponse<Avaliacao[]>>(
      `${this.fullUrl}/vinculo/${idTurmaProfessor}`,
      { params: httpParams }
    );
  }

  // Criar avaliação com arquivo
  createWithFile(data: AvaliacaoInput, arquivo?: File): Observable<ApiResponse<Avaliacao>> {
    const formData = new FormData();
    formData.append('idTurmaProfessor', data.idTurmaProfessor.toString());
    if (data.idPeriodoLetivo) formData.append('idPeriodoLetivo', data.idPeriodoLetivo.toString());
    if (data.titulo) formData.append('titulo', data.titulo);
    if (data.dataAplicacao) formData.append('dataAplicacao', data.dataAplicacao);
    if (data.tipo) formData.append('tipo', data.tipo);
    if (data.peso) formData.append('peso', data.peso.toString());
    if (arquivo) formData.append('arquivo', arquivo);

    return this.http.post<ApiResponse<Avaliacao>>(this.fullUrl, formData);
  }

  // Atualizar avaliação com arquivo
  updateWithFile(id: number, data: Partial<AvaliacaoInput>, arquivo?: File): Observable<ApiResponse<Avaliacao>> {
    const formData = new FormData();
    if (data.idTurmaProfessor) formData.append('idTurmaProfessor', data.idTurmaProfessor.toString());
    if (data.idPeriodoLetivo) formData.append('idPeriodoLetivo', data.idPeriodoLetivo.toString());
    if (data.titulo) formData.append('titulo', data.titulo);
    if (data.dataAplicacao) formData.append('dataAplicacao', data.dataAplicacao);
    if (data.tipo) formData.append('tipo', data.tipo);
    if (data.peso) formData.append('peso', data.peso.toString());
    if (arquivo) formData.append('arquivo', arquivo);

    return this.http.put<ApiResponse<Avaliacao>>(`${this.fullUrl}/${id}`, formData);
  }

  // Download arquivo da prova
  downloadArquivo(id: number): Observable<Blob> {
    return this.http.get(`${this.fullUrl}/${id}/arquivo`, { responseType: 'blob' });
  }

  // Remover arquivo
  removeArquivo(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.fullUrl}/${id}/arquivo`);
  }
}
