import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Photo } from '../../types/member';

@Injectable({
  providedIn: 'root'
})
export class ModeratorService {

private baseUrl = environment.apiUrl;
private http = inject(HttpClient);
  
getPhotosForModeration (){
      return this.http.get<Photo[]>(this.baseUrl+'admin/photos-to-moderate')
    } 

approvePhoto(photo: Photo){
  return this.http.put(this.baseUrl+'admin/approve-photo/'+photo.id,{})
}

rejectPhoto(photo: Photo){
  return this.http.put(this.baseUrl+'admin/reject-photo/'+photo.id,{})
}
}
