/**
 * ============================================
 * SIGEA Frontend - Coordenador Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { Coordenador, CoordenadorInput } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CoordenadorService extends BaseApiService<Coordenador, CoordenadorInput> {
  protected endpoint = 'coordenadores';

  constructor(http: HttpClient) {
    super(http);
  }
}
