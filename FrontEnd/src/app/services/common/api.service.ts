import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly apiUrl = 'http://localhost:8000/';

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams: HttpParams | undefined;
    if (params && Object.keys(params).length > 0) {
      httpParams = Object.entries(params).reduce(
        (p, [k, v]) => p.set(k, String(v)),
        new HttpParams()
      );
    }
    return this.http.get<T>(this.apiUrl + path, { params: httpParams });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.apiUrl + path, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.apiUrl + path, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.apiUrl + path);
  }
}
