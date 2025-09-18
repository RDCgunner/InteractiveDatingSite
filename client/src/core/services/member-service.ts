import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, MemberParams, Photo } from '../../types/member';
import { AccountService } from './account-service';
import { Token } from '@angular/compiler';
import { tap } from 'rxjs';
import { PaginatedResult } from '../../types/pagination';

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
  
  getMembers(memberParams: MemberParams){
    let paramsForHttpCall = new HttpParams();
    paramsForHttpCall=paramsForHttpCall.append('pageNumber',memberParams.pageNumber);
    paramsForHttpCall=paramsForHttpCall.append('pageSize',memberParams.pageSize);
    paramsForHttpCall=paramsForHttpCall.append('minAge',memberParams.minAge);
    paramsForHttpCall=paramsForHttpCall.append('maxAge',memberParams.maxAge);
    paramsForHttpCall=paramsForHttpCall.append('orderBy',memberParams.orderBy);

    if (memberParams.gender) {
      paramsForHttpCall=paramsForHttpCall.append('gender',memberParams.gender);
    }
    
    return this.httpClient.get<PaginatedResult<Member>>(this.baseUrl+'members',{params: paramsForHttpCall})
      .pipe(
        tap(()=>{
          localStorage.setItem('filters',JSON.stringify(memberParams))
        })
      )
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

  uploadPhoto(file: File){
    const formData = new FormData();
    formData.append('file',file);
    return this.httpClient.post<Photo>(this.baseUrl+'members/add-photo',formData)
  }

  setMainPhoto (photo: Photo){
    return this.httpClient.put(this.baseUrl+'members/set-main-photo/'+photo.id, {})
  }

  deletePhoto (photo: Photo){
    return this.httpClient.delete(this.baseUrl+'members/delete-photo/'+photo.id)
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
