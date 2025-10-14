import { Component, inject, OnInit, signal } from '@angular/core';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { MessageService } from '../../core/services/message-service';
import { Paginator } from "../../shared/paginator/paginator";
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-messages',
  imports: [Paginator,RouterLink,DatePipe],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages implements OnInit{
  

  private messageService = inject(MessageService);
  protected container ="Inbox";
  protected fetchedContainer = 'Inbox';
  protected pageNumber= 1;
  protected pageSize = 10;
  protected paginatedMessages = signal<PaginatedResult<Message> |null> (null)


tabs = [{label:"Inbox",value:"Inbox"},
        {label:"Outbox",value:"Outbox"}]

ngOnInit(): void {
    this.loadMessages();
  }

loadMessages (){
  this.messageService.getMessages(this.container,this.pageNumber,this.pageSize).subscribe({
    next: response => {this.paginatedMessages.set(response);
                        this.fetchedContainer=this.container;
    }
  })
}
deleteMessage(event: Event, id: string){
  event.stopPropagation();
  this.messageService.deleteMessage(id).subscribe({
    next: ()=>{
      const currentM = this.paginatedMessages();
      if (currentM?.items){
        this.paginatedMessages.update(prev => {
          if (!prev) return null;
          const newItems = prev.items.filter(x=> x.id !==id) || [];
          return {
            items:newItems,
            metadata:prev.metadata
          }
        })
      }
    
      // this.loadMessages();
    }


    
  })

}

get isInbox(){
  return this.fetchedContainer==='Inbox';
}

setContainer(container: string){
  this.container=container;
  this.loadMessages();
  this.pageNumber=1;
}

onPageChange( event: {pageNumber:number, pageSize: number}){
    this.pageNumber=event.pageNumber;
    this.pageSize=event.pageSize;
    this.loadMessages();
  }


}
