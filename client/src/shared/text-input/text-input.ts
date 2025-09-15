import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  imports: [ReactiveFormsModule],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css'
})
export class TextInput implements ControlValueAccessor{
  label = input<string>('');
  type = input<string>('');
  maxDate= input<string>('');



  writeValue(obj: any): void {
    
  }
  registerOnChange(fn: any): void {
    
  }
  registerOnTouched(fn: any): void {
    
  }
  
  //TextInput component is a type of NgCOntrol, and assigning it the valueAccessor 
  //Self is a modifier that restricts the dependency injected (ngcontrol )on the current element==dont reuse ngcontrol

    constructor(@Self() public ngControl:NgControl) {
    this.ngControl.valueAccessor= this;
    // this.control.errors!['minlength'].requiredLength=20;

  }

get control(){
  return this.ngControl.control as FormControl;
}


}
