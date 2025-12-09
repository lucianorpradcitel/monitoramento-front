import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Ignora a rota de autenticação para não criar loop
    if (req.url.includes('/Autenticar')) {
      console.log('[INTERCEPTOR] Rota de autenticação, não adiciona token');
      return next.handle(req);
    }

    const token = this.authService.getToken();
    
    if (!token) {
      console.log('[INTERCEPTOR] Nenhum token encontrado');
      return next.handle(req);
    }

    console.log('[INTERCEPTOR] Token encontrado, adicionando ao header');
    
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // Trata erro 401 (Unauthorized - token inválido/expirado)
        if (error.status === 401 && !this.isRefreshing) {
          console.error('%c[INTERCEPTOR] Erro 401: Token inválido ou expirado', 'color: red');
          return this.handle401Error(req, next);
        }

        // Trata erro 403 (Forbidden - sem permissão)
        if (error.status === 403) {
          console.error('%c[INTERCEPTOR] Erro 403: Sem permissão para acessar este recurso', 'color: red');
        }

        // Trata erro 500 (Internal Server Error)
        if (error.status === 500) {
          console.error('%c[INTERCEPTOR] Erro 500: Erro interno no servidor', 'color: red');
        }

        // Trata erro de rede
        if (error.status === 0) {
          console.error('%c[INTERCEPTOR] Erro de rede: Servidor inacessível', 'color: red');
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Tenta renovar o token e reenviar a requisição
   */
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    this.isRefreshing = true;
    console.log('%c[INTERCEPTOR] Tentando renovar token...', 'color: orange');

    return this.authService.autenticarAutomaticamente().pipe(
      switchMap((newToken: string) => {
        this.isRefreshing = false;
        console.log('%c[INTERCEPTOR] Token renovado com sucesso!', 'color: green');
        
        // Reenvia a requisição original com o novo token
        const retryReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });
        
        return next.handle(retryReq);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        console.error('%c[INTERCEPTOR] Falha ao renovar token, fazendo logout...', 'color: red');
        
        // Se falhar ao renovar, faz logout
        this.authService.logout();
        
        return throwError(() => error);
      })
    );
  }
}