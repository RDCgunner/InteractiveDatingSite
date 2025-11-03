import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Member } from '../../../types/member';
import { filter, first, firstValueFrom, Observable, single } from 'rxjs';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { AccountService } from '../../../core/services/account-service';
import { PresenceService } from '../../../core/services/presence-service';
import { LikesService } from '../../../core/services/likes-service';

@Component({
  selector: 'app-member-detailed',
  imports: [RouterLink,RouterLinkActive,RouterOutlet,AgePipe],
  templateUrl: './member-detailed.html',
  styleUrl: './member-detailed.css'
})
export class MemberDetailed implements OnInit{
 

  protected memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private router=inject(Router);
  protected presenceService = inject(PresenceService); 
  protected title = signal<string | undefined>('Profile');
  private rootId = signal<string|null>(null);
  protected likeService = inject(LikesService);

  protected isCurrentUser = (()=>{
    return this.accountService.currentUser()?.id === this.rootId();
  })
constructor(){
  this.route.paramMap.subscribe(params => this.rootId.set(params.get('id')));
}
 ngOnInit()  {

    // this.route.data.subscribe(
    //   {
    //     next: data => {this.member?.set(data['memberF'])}
    //   }
    // )


     this.title.set(this.route.firstChild?.snapshot?.title);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: ()=> {this.title.set(this.route.firstChild?.snapshot?.title)}
    })
  }

  loadMember() {
    const id = this.route.snapshot.paramMap.get('id');
    if(!id) return;
    return this.memberService.getMember(id!);
  }

    hasLiked = computed (()=> 
    this.likeService.likeIds().includes(this.rootId()!)
    );
  
}
