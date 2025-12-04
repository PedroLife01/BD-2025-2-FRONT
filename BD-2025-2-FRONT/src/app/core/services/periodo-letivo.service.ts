/**
 * ============================================
 * SIGEA Frontend - Período Letivo Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { PeriodoLetivo, PeriodoLetivoInput } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PeriodoLetivoService extends BaseApiService<PeriodoLetivo, PeriodoLetivoInput> {
  protected endpoint = 'periodos';

  constructor(http: HttpClient) {
    super(http);
  }
}
