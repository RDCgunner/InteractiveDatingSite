import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  
  return next(req).pipe(
    catchError(error => {
      if (error){
        switch (error.status) {
          case 400:
            toast.error(error.error);
            const modelStateError =[];
            for (const key in error.error.errors){
              if(error.error.errors[key]){
                modelStateError.push(error.error.errors[key])
              }
              else  {
                toast.error(error.error+ ' '+error.status )
              }
            }
            throw modelStateError.flat();
            break;
          case 401:
            toast.error('Unauthorized');
            break;
          case 404:
            toast.error('Not found');
            router.navigateByUrl('/not-found')
            break;
          case 500:
            toast.error('Server Error');
            router.navigateByUrl('/server-error')
            break;

          default:
            toast.error('Something went wrong');
            break;

        }
        
      }
      throw error;
    })
  )
};
