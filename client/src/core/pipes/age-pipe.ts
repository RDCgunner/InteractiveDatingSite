import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

  transform(dateOfBirth: string, ...args: unknown[]): number {
    const today= new Date();
    const dob = new Date(dateOfBirth);
    const monthDiff = today.getMonth()- dob.getMonth();

    let age = today.getFullYear()-dob.getFullYear();

   if (monthDiff<0 || monthDiff===0 && today.getDay()-dob.getDay()<0) age--;

   return age;
    
  }

}


