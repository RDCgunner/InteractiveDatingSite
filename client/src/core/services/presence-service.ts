import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastService } from './toast-service';
import { User } from '../../types/user';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private toast = inject(ToastService);
  hubConnection?: HubConnection;
  onlineUsers = signal<string[]>([]);

  createHubConnection(user:User){

    this.hubConnection =new HubConnectionBuilder()
    .withUrl(this.hubUrl+'presence',
      {accessTokenFactory: ()=>user.token})
    .withAutomaticReconnect()
    .build();
    this.hubConnection.start().catch(error=>this.toast.error(error));

    this.hubConnection.on('UserOnline',userIdConnected=> {
      this.toast.success(userIdConnected+' has connected');
      this.onlineUsers.update(users => [...users,userIdConnected]);
    });
    
    this.hubConnection.on('UserOffline',userIdConnected=>{
      this.toast.info(userIdConnected+' has disconnected');
      this.onlineUsers.update(users=> users.filter(x=> x!=userIdConnected));
    });

    this.hubConnection.on("GetOnlineUsers", returnedUserIds => {
      this.onlineUsers.set(returnedUserIds);
    });

    this.hubConnection.on("NewMessageReceived",(message : Message)=>{
      this.toast.info(message.senderDisplayName + ' has sent you a new message!', 15000,message.senderImageUrl, `/members/${message.senderId}/messages`)
    })
  }
  stopHubConnection(){
    if(this.hubConnection?.state===HubConnectionState.Connected) 
      this.hubConnection.stop().catch(error=>console.log(error))
  }
}
