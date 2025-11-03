import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-test-errors',
  imports: [],
  templateUrl: './test-errors.html',
  styleUrl: './test-errors.css'
})
export class TestErrors {

 httpClient = inject(HttpClient);
 baseUrl = environment.apiUrl;
 validationError = signal<string[]>([]);

 get404Error (){
  this.httpClient.get(this.baseUrl+'buggy/not-found').subscribe({
    error: error=> {console.log(error)}
  })
 }

get400Error (){
  this.httpClient.get(this.baseUrl+'buggy/bad-request').subscribe({
    error: error=> {
      console.log(error);
      this.validationError.set(error)
    }
  })
 }


get500Error (){
  this.httpClient.get(this.baseUrl+'buggy/server-error').subscribe({
    error: error=> {console.log(error)}
  })
 }

 get400RegisterError (){
  this.httpClient.post(this.baseUrl+'account/register',{}).subscribe({
    error: error=> {console.log(error)}
  })
 }




}
