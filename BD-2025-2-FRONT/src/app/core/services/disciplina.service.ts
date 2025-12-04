/**
 * ============================================
 * SIGEA Frontend - Disciplina Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { Disciplina, DisciplinaInput } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DisciplinaService extends BaseApiService<Disciplina, DisciplinaInput> {
  protected endpoint = 'disciplinas';

  constructor(http: HttpClient) {
    super(http);
  }
}
