import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Member } from '../../../types/member';
import { filter, first, firstValueFrom, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { errorContext } from 'rxjs/internal/util/errorContext';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-member-detailed',
  imports: [AsyncPipe,RouterLink,RouterLinkActive,RouterOutlet],
  templateUrl: './member-detailed.html',
  styleUrl: './member-detailed.css'
})
export class MemberDetailed implements OnInit{
 

  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
 private router=inject(Router);
  protected member$?: Observable<Member>;
  protected title = signal<string | undefined>('Profile');

 ngOnInit()  {

     this.member$=this.loadMember();

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
}
