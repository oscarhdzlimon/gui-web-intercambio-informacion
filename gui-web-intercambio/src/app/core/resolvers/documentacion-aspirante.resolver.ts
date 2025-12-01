import {ResolveFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {VerificacionDocsService} from '@services/verificacion-docs.service';
import {catchError} from 'rxjs/operators';
import {AlertService} from '@services/alert.service';

export const documentacionAspiranteResolver: ResolveFn<any> = (route, state) => {
  const idUsuario: number = route.paramMap.get('id') as unknown as number;
  const verificacionDocsService: VerificacionDocsService = inject(VerificacionDocsService);
  const router: Router = inject(Router);
  const alertService: AlertService = inject(AlertService);

  return verificacionDocsService.consultarPerfilDetalle(idUsuario).pipe(
    catchError((error) => {
      void router.navigate(['/privado/verificacion-documentos']);
      alertService.error('No se puede acceder al registro seleccionado');

      return error;
    })
  );
};
