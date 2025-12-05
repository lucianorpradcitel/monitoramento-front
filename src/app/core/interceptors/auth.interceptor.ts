import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Ignora a rota de autenticação para não criar loop
    if (req.url.includes('/Autenticar')) {
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
        if (error.status === 401) {
          console.error('%c[INTERCEPTOR] Erro 401: Token inválido ou expirado', 'color: red');
          this.handleUnauthorized();
        }

        // Trata erro 403 (Forbidden - sem permissão)
        if (error.status === 403) {
          console.error('%c[INTERCEPTOR] Erro 403: Sem permissão', 'color: red');
        }

        // Trata erro 500 (Internal Server Error)
        if (error.status === 500) {
          console.error('%c[INTERCEPTOR] Erro 500: Erro no servidor', 'color: red');
        }

        return throwError(() => error);
      })
    );
  }

  private handleUnauthorized(): void {
    console.log('[INTERCEPTOR] Limpando token e redirecionando...');
    
    // Limpa o localStorage e redireciona
    this.authService.logout();
    
    // Opcional: Mostrar mensagem ao usuário
    // Se você usa alguma biblioteca de notificação como ngx-toastr:
    // this.toastr.warning('Sua sessão expirou. Faça login novamente.', 'Sessão Expirada');
    
    // Ou alert simples (não recomendado para produção):
    // alert('Sua sessão expirou. Você será redirecionado para o login.');
  }
}
