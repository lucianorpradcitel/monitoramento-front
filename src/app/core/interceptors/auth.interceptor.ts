import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (!token) {
      console.log('[INTERCEPTOR] Nenhum token encontrado');
      return next.handle(req);
    }

    console.log('[INTERCEPTOR] Token encontrado, adicionando ao header');
    
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // ← AQUI: adiciona "Bearer " antes do token
      }
    });

    return next.handle(authReq);
  }
}