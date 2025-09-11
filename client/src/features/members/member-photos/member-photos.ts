import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Member, Photo } from '../../../types/member';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ImageUpload } from '../../../shared/image-upload/image-upload';
import { AccountService } from '../../../core/services/account-service';
import { User } from '../../../types/user';
import { FavoriteButton } from "../../../shared/favorite-button/favorite-button";
import { DeleteButton } from "../../../shared/delete-button/delete-button";

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, FavoriteButton, DeleteButton],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  public memberService = inject(MemberService);
  protected accountService = inject (AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected photos = signal<Photo[]>([]);
  protected loading = signal(false);

  ngOnInit(): void {
    const memberId = this.route.parent?.snapshot.paramMap.get('id');
    if (!memberId) {
      this.router.navigateByUrl('not-found');
      return;
    }
    this.memberService.getMemberPhotos(memberId).subscribe({
      next: (photo) => {
        this.photos.set(photo);
      },
    });
  }

  onUploadinImage(file: File){
    this.loading.set(true);
    this.memberService.uploadPhoto(file).subscribe({
      next: photo => {
        this.memberService.editMode.set(false);
        this.loading.set(false);
        this.photos.update(photos=> [...photos,photo])
      },
      error: error => {console.log("Error uploading image: "+error)
        this.loading.set(false);
      }
    })
  }

  setMainPhoto(photo:Photo){
    this.memberService.setMainPhoto(photo).subscribe({
      next: () =>{
          const currentUser = this.accountService.currentUser();
          if (currentUser) currentUser.imageUrl = photo.url;
          this.accountService.setUserCredentialsInLocalStorage(currentUser as User);
          this.memberService.memberProfile.update( member => ({
            ...member,
            imageUrl:photo.url
          }) as Member)
        }
          
    })
  }

  deletePhoto(photoId: Photo){
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {this.photos.update(photos => photos.filter(x=>x.id!==photoId.id));

      }
    })
  }
}
