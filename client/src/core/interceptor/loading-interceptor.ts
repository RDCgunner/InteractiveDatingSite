import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core';
import { delay, finalize, of, tap } from 'rxjs';



const cache = new Map<string , HttpEvent<unknown>>();
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  

  if (req.method==="GET"){
    const cachedResponse = cache.get(req.url);
    if (cachedResponse) return of(cachedResponse);
  }


  const busyService = inject(BusyService);
  busyService.busy();
  return next(req).pipe(
    delay(1500),
    tap((response)=>{cache.set(req.url,response)}),
    finalize(()=>busyService.idle())
  )
};
