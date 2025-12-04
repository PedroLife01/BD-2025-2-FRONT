/**
 * ============================================
 * SIGEA Frontend - Base API Service
 * ============================================
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginationParams } from '../models';

export abstract class BaseApiService<T, TInput> {
  protected abstract endpoint: string;
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected get fullUrl(): string {
    return `${this.apiUrl}/${this.endpoint}`;
  }

  findAll(params?: PaginationParams): Observable<ApiResponse<T[]>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.order) httpParams = httpParams.set('order', params.order);
    }

    return this.http.get<ApiResponse<T[]>>(this.fullUrl, { params: httpParams });
  }

  findById(id: number): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.fullUrl}/${id}`);
  }

  create(data: TInput): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.fullUrl, data);
  }

  update(id: number, data: Partial<TInput>): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.fullUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.fullUrl}/${id}`);
  }
}
