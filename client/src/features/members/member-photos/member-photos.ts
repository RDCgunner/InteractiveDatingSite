import { Component, inject } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Photo } from '../../../types/member';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-member-photos',
  imports: [AsyncPipe],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css'
})
export class MemberPhotos {
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected photos$?: Observable<Photo[] | undefined>


 constructor(){
  const memberId = this.route.parent?.snapshot.paramMap.get('id');
  if (!memberId) {
     this.router.navigateByUrl('not-found');
     return 
  }
  this.photos$ = this.memberService.getMemberPhotos(memberId);
 }

}
