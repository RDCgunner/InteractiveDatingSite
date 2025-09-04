import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  httpService = inject(HttpClient);
  private baseUrl = environment.apiUrl;;
  currentUser = signal<User | null>(null);

  register(creds: RegisterCreds) {
    return this.httpService.post<User>(this.baseUrl + 'account/register', creds).pipe(
      tap((user) => {
        if (user) {
          this.setUserCredentialsInLocalStorage(user);
        }
      })
    );
  }

  login(creds: LoginCreds) {
    return this.httpService.post<User>(this.baseUrl + 'account/login', creds).pipe(
      tap((user) => {
        if (user) {
          this.setUserCredentialsInLocalStorage(user);
        }
      })
    );
  }

  setUserCredentialsInLocalStorage(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('user');
  }
}
