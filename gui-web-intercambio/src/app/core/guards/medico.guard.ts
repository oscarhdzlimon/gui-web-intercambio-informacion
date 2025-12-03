import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {Observable, of, switchMap} from 'rxjs';
import {inject} from '@angular/core';
import {AuthService} from '@services/auth.service';

export const medicoGuard: CanActivateFn = (route, state) => {
  return checkMedicalProfile();
};

const checkMedicalProfile = (): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService: AuthService = inject(AuthService);

  return authService.checkAuthStatus().pipe(
    switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        return of(false);
      }

      const idPerfil = authService.usuarioSesion?.idPerfil as number;

      if (!authService.usuarioSesion) {
        return of(router.createUrlTree(['/login']));
      }

      if ([1, 2, 3].includes(idPerfil)) {
        return of(true);
      } else {
        return of(router.createUrlTree(['/privado/verificacion-documentos']));
      }
    })
  );
};
