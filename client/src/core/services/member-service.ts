import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, Photo } from '../../types/member';
import { AccountService } from './account-service';
import { Token } from '@angular/compiler';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private httpClient = inject(HttpClient);
  private accontService = inject(AccountService)
  private baseUrl = environment.apiUrl;
  localStorage: any;
  public editMode=signal(false);
  public memberProfile = signal<Member | null>(null);
  
  getMembers(){
    return this.httpClient.get<Member[]>(this.baseUrl+'members');
  }
  
  getMember(id: string){
    return this.httpClient.get<Member>(this.baseUrl+'members/'+id).pipe(
      tap( member=>{
        this.memberProfile.set(member)
      })
    )

  }
  

  getMemberPhotos(id: string){
    return this.httpClient.get<Photo[]>(this.baseUrl+'members/' + id+ '/photos')
  }


  updateMember(member:EditableMember){
    return this.httpClient.put(this.baseUrl+'members',member);
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
