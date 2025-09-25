import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { environment } from '../../environments/environment';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private httpClient = inject(HttpClient);
  private accontService = inject(AccountService)
  private baseUrl = environment.apiUrl;
  
  getMessages(container: string, pageNumber: number, pageSize: number){
    let params = new HttpParams();
    params = params.append('pageNumber',pageNumber);
    params = params.append('pageSize',pageSize);
    params = params.append('container',container);
    return this.httpClient.get<PaginatedResult<Message>>(this.baseUrl+'messages',{params});
  }

}
