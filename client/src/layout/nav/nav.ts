import { Component, inject,signal } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink,RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {

protected accountService = inject(AccountService);
protected toastService = inject(ToastService)

protected router = inject(Router);
protected creds : any = {};


login() {
    this.accountService.login(this.creds).subscribe(
      {next: results => {
        this.router.navigateByUrl('/members');
        console.log(results);
        //this.loggedIn.set(true);
        this.toastService.success("Login successfull!")
        this.creds={};

      },
        error: error => {

          console.log(error);
          //alert(error.error);
          this.toastService.error(error.error);
        }
          
      }
    )

    };
  logout(){
    this.accountService.logout();
    this.router.navigateByUrl('/');
    //return this.loggedIn.set(false);
    }
}
