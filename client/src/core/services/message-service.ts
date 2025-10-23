import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AccountService } from './account-service';
import { environment } from '../../environments/environment';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private httpClient = inject(HttpClient);
  private accontService = inject(AccountService);
  private baseUrl = environment.apiUrl;
  private hubUrl = environment.hubUrl;
  private hubConnection? : HubConnection;
  messageThread = signal<Message[]>([]);


  createHubConnection(otherUserId: string){
    const currentUser = this.accontService.currentUser();
    if (!currentUser) return;
    this.hubConnection = new HubConnectionBuilder().withUrl(this.hubUrl+'messages?userId='+otherUserId,{
      accessTokenFactory:() => currentUser.token

    }).withAutomaticReconnect().build();

    this.hubConnection.start().catch(error => console.error(error));

    this.hubConnection.on("ReceiveMessageThread", (messages: Message[])=>{
       {this.messageThread.set(messages.map(m => ({...m, currentUserSender:m.senderId!==otherUserId})
        ));
        messages.forEach(m=>console.log(m.senderId+m.currentUserSender))
        // this.scrollToBottom();
        }
    })
    this.hubConnection.on("NewMessage",(message:Message) =>{
      message.currentUserSender =message.senderId===currentUser.id;
      this.messageThread.update(messages => [...messages,message]);
    })
  }

  stopHubConnection () {
    if(this.hubConnection?.state===HubConnectionState.Connected){
      this.hubConnection.stop().catch(error => console.error(error));
    }
  };


  getMessages(container: string, pageNumber: number, pageSize: number){
    let params = new HttpParams();
    params = params.append('pageNumber',pageNumber);
    params = params.append('pageSize',pageSize);
    params = params.append('container',container);
    return this.httpClient.get<PaginatedResult<Message>>(this.baseUrl+'messages',{params});
  }

  getMessageThread(memberId: string){
    return this.httpClient.get<Message[]>(this.baseUrl+'messages/thread/'+memberId)
  }

  sendMessage(recipientId: string, content: string){
    // return this.httpClient.post<Message>(this.baseUrl+'messages',{recipientId,content})
      return this.hubConnection?.invoke('SendMessage',{recipientId,content})
  }

  deleteMessage(id: string){
    return this.httpClient.delete(this.baseUrl+'messages/'+id);
  }

}
