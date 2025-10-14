import { HttpEvent, HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core';
import { delay, finalize, of, tap } from 'rxjs';



const cache = new Map<string , HttpEvent<unknown>>();
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  
  const generateCacheKey = (url:string, params: HttpParams) : string => {
    const paramString = params.keys().map(key => `${key}=${params.get(key)}`).join('&');
    return paramString ? `${url}?${paramString}` :  url
  }
  const cacheKey = generateCacheKey(req.url,req.params);

  if (req.method==="GET"){
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) return of(cachedResponse);
  }
  

  const invalidateCache = (urlPattern : string ) => {
    for (const key of cache.keys()){
      if (key.includes(urlPattern)){
        cache.delete(key);
        console.log(`Cache invalidated for: ${key}`)
      }
    }
  }

  if(req.method.includes('POST')&& req.url.includes('/likes')){
    invalidateCache('/likes')
  }

  if(req.method.includes('POST')&& req.url.includes('/messages')){
    invalidateCache('/messages')
  }

  const busyService = inject(BusyService);
  busyService.busy();
  return next(req).pipe(
    delay(1500),
    tap((response)=>{cache.set(cacheKey,response)}),
    finalize(()=>busyService.idle())
  )
};
