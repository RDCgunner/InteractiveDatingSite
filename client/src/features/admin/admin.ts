import { Component, inject } from '@angular/core';
import { AccountService } from '../../core/services/account-service';
import { UserManagement } from "./user-management/user-management";
import { PhotosManagement } from "./photos-management/photos-management";

@Component({
  selector: 'app-admin',
  imports: [UserManagement, PhotosManagement],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

protected accountService = inject(AccountService);

activeTab = 'photos';
tabs=[
    {label:'Photo Moderation', value:'photos'},
    {label:'User Moderation', value:'roles'}
]

setTab (tab: string){
  this.activeTab=tab;
}


}
