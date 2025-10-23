import { Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { MemberService } from '../../../core/services/member-service';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../../core/services/presence-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe,TimeAgoPipe,FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css'
})
export class MemberMessages implements OnInit,OnDestroy{
  @ViewChild('messageEndRef') messageEndRef!: ElementRef;

  protected messageService = inject(MessageService);
  private memberService = inject(MemberService);
  protected presenceService = inject(PresenceService);
  // protected messages = signal<Message[]>([]);
  protected messageContent = '';
  private route = inject(ActivatedRoute);

  
  
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe({
      next: params =>{
        const otherUserId = params.get('id');
        if (!otherUserId) throw new Error('Cannot connect to hub');
        this.messageService.createHubConnection(otherUserId);
      }
    })
  }

  constructor(){
    effect(()=>{
      const currentMessages = this.messageService.messageThread;
      if (currentMessages.length>0) {
        this.scrollToBottom();
      }
    })
  }
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
  // loadMessages (){
  //   const memberId = this.memberService.memberProfile()?.id;
  //   if (memberId) {
  //     this.messageService.getMessageThread(memberId).subscribe({
  //       next: messagez => {this.messages.set(messagez.map(m => ({...m, currentUserSender:m.senderId!==memberId})
  //       ));
  //       messagez.forEach(m=>console.log(m.senderId+m.currentUserSender))
  //       // this.scrollToBottom();
  //       }
  //     })
  //   }
  // }

  sendMessage(){
    const recipientId = this.memberService.memberProfile()?.id;
    if (!recipientId) return;
    this.messageService.sendMessage(recipientId,this.messageContent)?.then(()=> {
      this.messageContent='';
    })
  }

  scrollToBottom(){
    setTimeout(()=>{if (this.messageEndRef){
      this.messageEndRef.nativeElement.scrollIntoView({behaviour:'smooth'})
    }})
    
  }
}
