import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { MemberService } from '../../../core/services/member-service';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe,TimeAgoPipe,FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css'
})
export class MemberMessages implements OnInit{
  @ViewChild('messageEndRef') messageEndRef!: ElementRef;

  private messageService = inject(MessageService);
  private memberService = inject(MemberService);

  protected messages = signal<Message[]>([]);
  protected messageContent = '';
  
  
  ngOnInit(): void {
    this.loadMessages();
  }

  constructor(){
    effect(()=>{
      const currentMessages = this.messages();
      if (currentMessages.length>0) {
        this.scrollToBottom();
      }
    })
  }
  loadMessages (){
    const memberId = this.memberService.memberProfile()?.id;
    if (memberId) {
      this.messageService.getMessageThread(memberId).subscribe({
        next: messagez => {this.messages.set(messagez.map(m => ({...m, currentUserSender:m.senderId!==memberId})
        ));
        messagez.forEach(m=>console.log(m.senderId+m.currentUserSender))
        // this.scrollToBottom();
        }
      })
    }
  }

  sendMessage(){
    const recipientId = this.memberService.memberProfile()?.id;
    if (!recipientId) return;
    this.messageService.sendMessage(recipientId,this.messageContent).subscribe({
      next: message => {
        this.messages.update(messages =>{
          message.currentUserSender = true;
          return [...messages,message]
        });
        this.messageContent='';
      }
    })
  }

  scrollToBottom(){
    setTimeout(()=>{if (this.messageEndRef){
      this.messageEndRef.nativeElement.scrollIntoView({behaviour:'smooth'})
    }})
    
  }
}
