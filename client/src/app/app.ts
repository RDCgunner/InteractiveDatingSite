import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Nav } from '../layout/nav/nav';

@Component({
  selector: 'app-root',
  imports: [Nav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit { 

  protected members = signal<any>([]);
  private http = inject(HttpClient);
  protected title = signal('Dating app');

  ngOnInit(){
    this.http.get('https://localhost:5001/api/members').subscribe({
      next: response =>{
        console.log(response);
        this.members.set(response);
      },
      error: error=>console.log(error),
      complete: ()=> console.log('Completed requests')
   } )}
      
  
  
}
