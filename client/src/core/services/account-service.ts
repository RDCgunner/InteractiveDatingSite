import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';
import { PresenceService } from './presence-service';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  httpService = inject(HttpClient);
  private likesService = inject(LikesService);
  private baseUrl = environment.apiUrl;;
  currentUser = signal<User | null>(null);
  private presenceService = inject(PresenceService);

  register(creds: RegisterCreds) {
    return this.httpService.post<User>(this.baseUrl + 'account/register', creds, {withCredentials: true}).pipe(
      tap((user) => {
        if (user) {
          this.setUserCredentialsInLocalStorage(user);
          this.startTokenRefreshInterval();
        }
      })
    );
  }


  refreshToken(){
    return this.httpService.post<User>(this.baseUrl+'account/refresh-token',{}, {withCredentials: true})
  }


  startTokenRefreshInterval(){
    setInterval(()=>{
      this.httpService.post<User>(this.baseUrl+'account/refresh-token',{}, {withCredentials: true}).subscribe({
        next: user=> {
          this.setUserCredentialsInLocalStorage(user);
        },
        error: () => {
          this.logout();
        }
      })
    }, 10*60*1000)
  }

  login(creds: LoginCreds) {
    return this.httpService.post<User>(this.baseUrl + 'account/login', creds,  {withCredentials: true}).pipe(
      tap((user) => {
        if (user) {
          this.setUserCredentialsInLocalStorage(user);
          this.startTokenRefreshInterval();
        }
      })
    );
  }

  setUserCredentialsInLocalStorage(user: User) {
    user.roles=this.getRolesFromToken(user);
    this.currentUser.set(user);
    // localStorage.setItem('user', JSON.stringify(user));
    this.likesService.getLikeIds();
    if (this.presenceService.hubConnection?.state!==HubConnectionState.Connected){
      this.presenceService.createHubConnection(user);
    }
  }

  logout() {
    this.httpService.post(this.baseUrl+'account/logout',{},{withCredentials:true}).subscribe({
      next: ()=>{this.currentUser.set(null);
    localStorage.removeItem('filters');
    localStorage.removeItem('user');
    this.likesService.clearLikeIds();
    this.presenceService.stopHubConnection();
    }})
    
  }

  private getRolesFromToken(user: User) :string[]{
    const payload = user.token.split('.')[1];
    const decoded = atob(payload);
    const jsonPayload =JSON.parse(decoded);
    return Array.isArray(jsonPayload.role)? jsonPayload.role : [jsonPayload.role];
  }
}
