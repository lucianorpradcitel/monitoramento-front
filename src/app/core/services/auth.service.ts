import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, of, tap, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private credentials = {
    userName: 'casafuradeiras',
    senha: 'citel13347'
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  autenticarAutomaticamente(): Observable<string> {
    const token = localStorage.getItem('token');
    
    // Verifica se o token existe E se não está expirado
    if (token && !this.isTokenExpired(token)) {
      console.log('%c[AUTH] Token válido encontrado', 'color: blue');
      return of(token);
    }

    if (token && this.isTokenExpired(token)) {
      console.log('%c[AUTH] Token expirado, removendo...', 'color: orange');
      this.clearToken();
    }

    console.log('%c[AUTH] Iniciando autenticação...', 'color: orange');
    
    return this.http.post<{token: string}>(`${this.baseUrl}/Autenticar`, this.credentials)
      .pipe(
        map(response => {
          console.log('[AUTH] Resposta da API:', response);
          return response.token;
        }),
        tap((jwt: string) => {
          console.log('[AUTH] Token extraído:', jwt);
          localStorage.setItem('token', jwt);
          console.log('%c[AUTH] Token armazenado com sucesso', 'color: green');
        }),
        catchError(error => {
          console.error('%c[AUTH] Erro na autenticação:', 'color: red', error);
          this.clearToken();
          return throwError(() => error);
        })
      );
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    
    // Se o token existe mas está expirado, limpa e retorna null
    if (token && this.isTokenExpired(token)) {
      console.log('%c[AUTH] Token expirado detectado no getToken()', 'color: red');
      this.logout();
      return null;
    }
    
    return token;
  }

  isTokenExpired(token: string): boolean {
    try {
      // Decodifica o JWT (payload está na segunda parte: header.payload.signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verifica se tem o campo 'exp' (expiration time)
      if (!payload.exp) {
        console.log('[AUTH] Token sem data de expiração');
        return false;
      }
      
      const expirationTime = payload.exp * 1000; // Converte para milliseconds
      const currentTime = Date.now();
      const isExpired = currentTime >= expirationTime;
      
      if (isExpired) {
        const expiredDate = new Date(expirationTime);
        console.log(`%c[AUTH] Token expirado em: ${expiredDate.toLocaleString()}`, 'color: red');
      }
      
      return isExpired;
    } catch (e) {
      console.error('[AUTH] Erro ao decodificar token:', e);
      return true; // Se não conseguir decodificar, considera expirado
    }
  }

  logout(): void {
    console.log('%c[AUTH] Fazendo logout...', 'color: orange');
    this.clearToken();
    this.router.navigate(['/login']); // Ajuste a rota conforme sua aplicação
  }

  clearToken(): void {
    localStorage.removeItem('token');
    // Se você tem outros dados no localStorage relacionados à autenticação:
    // localStorage.removeItem('user');
    // localStorage.removeItem('permissions');
    // Ou se quiser limpar tudo: localStorage.clear();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null;
  }

  // Método útil para obter informações do token
  getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('[AUTH] Erro ao extrair payload do token:', e);
      return null;
    }
  }

  // Método para verificar quanto tempo falta para expirar
  getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return null;

      const expirationTime = payload.exp * 1000;
      const remainingTime = expirationTime - Date.now();
      
      return remainingTime > 0 ? remainingTime : 0;
    } catch (e) {
      return null;
    }
  }
}
