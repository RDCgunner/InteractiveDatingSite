import { Component, inject,signal } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { AccountService } from '../../core/services/account-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
protected creds : any = {};
protected accountService = inject(AccountService);
//protected loggedIn = signal(false);

login() {
    this.accountService.login(this.creds).subscribe(
      {next: results => {
        console.log(results);
        //this.loggedIn.set(true);
        this.creds={};

      },
        error: error => {
          this.creds={};
          alert(error.message)}
      }
    )

    };
  logout(){
    this.accountService.logout();
    //return this.loggedIn.set(false);
    }
}
