import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModeratorService } from '../../../core/services/moderator-service';
import { Photo } from '../../../types/member';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-photos-management',
  imports: [],
  templateUrl: './photos-management.html',
  styleUrl: './photos-management.css'
})
export class PhotosManagement implements OnInit{

protected moderatorService = inject(ModeratorService);
protected photosToModerate = signal<Photo[]> ([]);




ngOnInit(): void {
  this.getPhotosToBeModerated();
}

approvePhoto(photo: Photo){
  this.moderatorService.approvePhoto(photo).subscribe({
    next: ()=>{
      this.getPhotosToBeModerated();
    }
  })
}

getPhotosToBeModerated(){
  this.moderatorService.getPhotosForModeration().subscribe({
    next: photoList => this.photosToModerate.set(photoList)
  })
}

rejectPhoto(photo: Photo){
  this.moderatorService.rejectPhoto(photo).subscribe({
    next: ()=>{
      this.getPhotosToBeModerated();
    }
  })
}

}
