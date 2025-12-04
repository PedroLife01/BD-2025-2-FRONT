/**
 * ============================================
 * SIGEA Frontend - Professor Service
 * ============================================
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { Professor, ProfessorInput } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService extends BaseApiService<Professor, ProfessorInput> {
  protected endpoint = 'professores';

  constructor(http: HttpClient) {
    super(http);
  }
}
