import {inject} from '@angular/core';
import {CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {CME_TOKEN} from '@utils/constants';

export const redirectIfAuthenticatedGuard: CanActivateFn = (route, state) => {
  return checkAuth(state);
};

const checkAuth = (state: RouterStateSnapshot): Observable<boolean> => {
  const router = inject(Router);
 /*  if (localStorage.getItem(CME_TOKEN)) {
    void router.navigate(['/privado/inicio']);
    return of(false)
  } */
  return of(true);
};
