import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard = () => {
  const authService = inject(AuthService);

  console.log('[GUARD] Verificando autenticação...');

  return authService.autenticarAutomaticamente().pipe(
    map(() => {
      console.log('[GUARD] Autenticação OK, liberando acesso');
      return true;
    }),
    catchError((err) => {
      console.error('[GUARD] Falha na autenticação:', err);
      return of(false);
    })
  );
};