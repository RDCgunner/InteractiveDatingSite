import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of, tap } from 'rxjs';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root'
})
export class InitService {

  private accountService = inject(AccountService);
  private likeService = inject(LikesService);

  init() {
    

    // const userString = localStorage.getItem('user');
    // if (!userString) return of(null);
    // const user = JSON.parse(userString);
    return this.accountService.refreshToken().pipe(
      tap(user=> {
        if(user) {
          this.accountService.setUserCredentialsInLocalStorage(user);
          this.accountService.startTokenRefreshInterval();

        }
      })
    )
    
    // return of(null); 
  }
  
}
