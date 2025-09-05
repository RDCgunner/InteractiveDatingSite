import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member, Photo } from '../../types/member';
import { AccountService } from './account-service';
import { Token } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private httpClient = inject(HttpClient);
  private accontService = inject(AccountService)
  private baseUrl = environment.apiUrl;
  localStorage: any;

  getMembers(){
    return this.httpClient.get<Member[]>(this.baseUrl+'members');
  }
  
  getMember(id: string){
    return this.httpClient.get<Member>(this.baseUrl+'members/'+id);
  }
  

  getMemberPhotos(id: string){
    return this.httpClient.get<Photo[]>(this.baseUrl+'members/' + id+ '/photos')
  }



//deprecated
private getHttpOptions(){
  return {
    headers: new HttpHeaders({
     Authorization: 'Bearer '+this.accontService.currentUser()?.token
      //Authorization: 'Bearer '+  JSON.parse(localStorage.getItem('user')!)["token"]

    })
  }

}

}
