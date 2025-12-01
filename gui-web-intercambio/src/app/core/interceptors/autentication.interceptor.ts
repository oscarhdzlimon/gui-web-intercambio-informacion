import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {CME_TOKEN} from '@utils/constants';
import { AuthService } from "@services/auth.service";
import { Injectable } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";
import { AlertService } from "@services/alert.service";

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService, protected _alertServices: AlertService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string | null = localStorage.getItem(CME_TOKEN);

    if (token) {
      const isExpired = new JwtHelperService().isTokenExpired(token); // Importa JwtHelperService aquí

      if (isExpired) {
        console.error('Token expirado (Cliente-side). Redirigiendo a Login.');
        this.authService.cerrarSesion(); // Llama al método que limpia el almacenamiento y redirige
        setTimeout(() => {
        this._alertServices.alerta("Su sesión expiró");
        }, 1000);

        // Devolver un Observable que lanza un error para detener la solicitud
        return throwError(() => new Error('Sesión expirada.'));
      }

      // Paso 2: Si no está expirado, adjuntar el token
      const request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Paso 3: Continuar y mantener el manejo del 401 como respaldo de seguridad
/*       return next.handle(request).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.authService.cerrarSesion(); // Limpia y redirige si el servidor dice 401
            return throwError(() => new Error('Sesión expirada por error 401.'));
          }
          return throwError(() => err);
        })
      ); */
      return next.handle(request); // CON token
    }

    return next.handle(req); // Sin token, continúa


  }
}
