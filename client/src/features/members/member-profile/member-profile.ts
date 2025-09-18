import { Component, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditableMember, Member } from '../../../types/member';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';
import { AccountService } from '../../../core/services/account-service';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe,FormsModule,TimeAgoPipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css'
})
export class MemberProfile implements OnInit, OnDestroy{
  

  @ViewChild ('editForm') editForm?:NgForm;
  @HostListener('window:beforeunload',['$event']) notify ($event:BeforeUnloadEvent){
    if (this.editForm?.dirty){
      $event.preventDefault();
    }
  }

  protected toast = inject(ToastService);
  protected memberService = inject(MemberService);
  protected accountService = inject(AccountService);
  // protected route = inject(ActivatedRoute);
  // member = signal<Member | undefined>(undefined);

  protected editableMember: EditableMember={
     displayName:'',
     description:'',
     city:'',
     country:''
  }

  constructor(){}

  // deprecated as member will be set in member service signal
  // ngOnInit(): void {
  //     this.route.parent?.data.subscribe({
  //       next: data=>{
  //         this.member.set(data['memberF']);
  //                 }

  //     })
  //     this.editableMember={
  //       displayName:this.member()?.displayName || '',
  //       description:this.member()?.description || '',
  //       city:this.member()?.city || '',
  //       country:this.member()?.country || '',
  //     }
  // }

  ngOnInit(): void { 
    this.editableMember={
        displayName:this.memberService.memberProfile()?.displayName || '',
        description:this.memberService.memberProfile()?.description || '',
        city:this.memberService.memberProfile()?.city || '',
        country:this.memberService.memberProfile()?.country || '',
      }
      
  }
  
  updateProfile (){
    if (!this.memberService.memberProfile()) return
    const updatedMember = {...this.memberService.memberProfile(),...this.editableMember};
    this.memberService.updateMember(this.editableMember).subscribe({
      next: ()=>{console.log(updatedMember);
                  const currentUser = this.accountService.currentUser();
                  if (currentUser && updatedMember.displayName!==currentUser?.displayName)
                    {
                      currentUser.displayName=updatedMember.displayName;
                      this.accountService.setUserCredentialsInLocalStorage(currentUser);
                    }
                  this.toast.success('Profile updated successfully')
                  this.memberService.editMode.set(false);
                  this.memberService.memberProfile.set(updatedMember as Member);
                  this.editForm?.reset(updatedMember);
      }
    })}
 
    

  
       

  ngOnDestroy(): void {
   if (this.memberService.editMode()) this.memberService.editMode.set(false);
  }

}
