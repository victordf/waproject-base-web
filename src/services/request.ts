import IRequest from 'interfaces/models/request';
import { IPaginationParams, IPaginationResponse } from 'interfaces/pagination';
import { Observable } from 'rxjs';

import apiService, { ApiService } from './api';

export class RequestService {
  constructor(private apiService: ApiService) {}

  public list(params: IPaginationParams): Observable<IPaginationResponse<IRequest>> {
    return this.apiService.get('/request', params);
  }

  public save(model: Partial<IRequest>): Observable<IRequest> {
    if (model.id) return this.apiService.put('/request', model);
    return this.apiService.post('/request', model);
  }

  public delete(id: number): Observable<void> {
    return this.apiService.delete(`/request/${id}`);
  }
}

const requestService = new RequestService(apiService);
export default requestService;
