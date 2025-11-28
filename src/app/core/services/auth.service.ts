import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://monint.citelsoftware.com.br';
  private credentials = {
    userName: 'casafuradeiras',
    senha: 'citel13347'
  };

  constructor(private http: HttpClient) {}

  autenticarAutomaticamente(): Observable<string> {
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('%c[AUTH] Token já existe', 'color: blue');
      return of(token);
    }

    console.log('%c[AUTH] Iniciando autenticação...', 'color: orange');
    
    // A API retorna um objeto JSON, não apenas texto
    return this.http.post<{token: string}>(`${this.baseUrl}/Autenticar`, this.credentials)
      .pipe(
        map(response => {
          // Extrai o token do objeto
          console.log('[AUTH] Resposta da API:', response);
          return response.token;
        }),
        tap((jwt: string) => {
          console.log('[AUTH] Token extraído:', jwt);
          localStorage.setItem('token', jwt);
          console.log('%c[AUTH] Token armazenado com sucesso', 'color: green');
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
