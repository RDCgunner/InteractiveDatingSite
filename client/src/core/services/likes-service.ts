import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Member, MemberParams } from '../../types/member';
import { PaginatedResult } from '../../types/pagination';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LikesService {
  
  
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<string[]>([]);

  

  toggleLike(targetMemberId:string ) {
    return this.http.post(`${this.baseUrl}likes/${targetMemberId}`,{}).subscribe({
      next: ()=> {
        if (this.likeIds().includes(targetMemberId))
          this.likeIds.update(ids => ids.filter(x=>x!==targetMemberId))
        else
          this.likeIds.update(ids => [...ids,targetMemberId]);
      }
    })
  }

  getLikes(predicate: string, memberParams: MemberParams){
    let paramsForHttpCall = new HttpParams();
    paramsForHttpCall=paramsForHttpCall.append('pageNumber',memberParams.pageNumber);
    paramsForHttpCall=paramsForHttpCall.append('pageSize',memberParams.pageSize);

    return this.http.get<PaginatedResult<Member>>(this.baseUrl+'likes?predicate='+predicate,{params: paramsForHttpCall})
      .pipe(
              tap(()=>{
                localStorage.setItem('filters',JSON.stringify(memberParams))
              })
    );
  }

  //for login
  getLikeIds(){
    return this.http.get<string[]>(this.baseUrl+'likes/list').subscribe({
      next: ids => { this.likeIds.set(ids)}
    })
  }

  //for logout
  clearLikeIds(){
    this.likeIds.set([]);
  }

}
