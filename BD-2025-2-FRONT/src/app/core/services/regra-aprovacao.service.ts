/**
 * ============================================
 * SIGEA Frontend - Regra de Aprovação Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { RegraAprovacao, RegraAprovacaoInput, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RegraAprovacaoService extends BaseApiService<RegraAprovacao, RegraAprovacaoInput> {
  protected endpoint = 'regras';

  constructor(http: HttpClient) {
    super(http);
  }

  // Buscar regras por escola
  findByEscola(idEscola: number): Observable<ApiResponse<RegraAprovacao[]>> {
    return this.http.get<ApiResponse<RegraAprovacao[]>>(`${this.fullUrl}/escola/${idEscola}`);
  }
}
