import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-favorite-button',
  imports: [],
  templateUrl: './favorite-button.html',
  styleUrl: './favorite-button.css'
})
export class FavoriteButton {

  isSelected = input<boolean>();
  isDisabled = input<boolean>();
  clickEvent = output<Event>();

  onClick (event: Event) {this.clickEvent.emit(event)}

}
