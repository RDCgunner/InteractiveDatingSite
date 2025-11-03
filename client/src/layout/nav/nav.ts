import { Component, inject,OnInit,signal } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../themes';
import { MemberService } from '../../core/services/member-service';
import { BusyService } from '../../core/services/busy-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink,RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav implements OnInit{
  

protected accountService = inject(AccountService);
protected toastService = inject(ToastService);
protected memberService = inject(MemberService);
protected busyService = inject(BusyService);
protected loading = signal(false);

protected router = inject(Router);
protected creds : any = {};

protected selectedTheme = signal<string>(localStorage.getItem('theme')|| 'light');
protected themes=themes;


ngOnInit(): void {
  document.documentElement.setAttribute('data-theme',this.selectedTheme());
  }




handleSelectedTheme(theme: string){
  this.selectedTheme.set(theme);
  localStorage.setItem('theme',theme);
  document.documentElement.setAttribute('data-theme',theme);
  //hides the dropdonw from DaisyUI
  const elem = document.activeElement as HTMLDivElement;
  if (elem) elem.blur();
}

handleSelectUserItem(){
  const elem = document.activeElement as HTMLDivElement;
  if (elem) elem.blur();
}

login() {
  this.loading.set(true);
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
        },
        complete: ()=> this.loading.set(false)
          
      }
    )

    };
  logout(){
    this.accountService.logout();
    this.router.navigateByUrl('/');
    //return this.loggedIn.set(false);
    }
}
