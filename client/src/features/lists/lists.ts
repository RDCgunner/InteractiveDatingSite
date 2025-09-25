import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { LikesService } from '../../core/services/likes-service';
import { Member, MemberParams } from '../../types/member';
import { MemberCard } from "../members/member-card/member-card";
import { FilterModal } from '../members/filter-modal/filter-modal';
import { PaginatedResult } from '../../types/pagination';
import { Paginator } from "../../shared/paginator/paginator";

@Component({
  selector: 'app-lists',
  imports: [MemberCard, Paginator],
  templateUrl: './lists.html',
  styleUrl: './lists.css'
})
export class Lists implements OnInit{
  
@ViewChild('filterModal') modal!: FilterModal;

  private likesService = inject(LikesService);
  protected predicate = 'liked';
  protected memberParams = new MemberParams();
  protected paginatedMembers=signal<PaginatedResult<Member>| null> (null);
  


  tabs = [
    {label:'Liked', value:'liked'},
    {label:'Liked me', value:'likedBy'},
    {label:'Mutual', value:'mutual'}
  ]

  ngOnInit(): void {
    this.loadLikes();
  }

  setPredicate(predicate:string){
    if (this.predicate!==predicate){
      this.predicate=predicate;
      this.loadLikes();
    }
  }

onPageChange( event: {pageNumber:number, pageSize: number}){
    this.memberParams.pageNumber=event.pageNumber;
    this.memberParams.pageSize=event.pageSize;
    this.loadLikes();

  }

  loadLikes(){
    this.likesService.getLikes(this.predicate, this.memberParams ).subscribe({
      next:  member=> this.paginatedMembers.set(member)
        
    })
  }
}
