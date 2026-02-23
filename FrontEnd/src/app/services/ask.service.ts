import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './common/api.service';

export interface AskRequest {
  topic: string;
  model_override?: string;
}

export interface AskResponse {
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class AskService {
  constructor(private readonly api: ApiService) {}

  ask(request: AskRequest): Observable<AskResponse> {
    return this.api.post<AskResponse>('ask', request);
  }
}
