import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import {Observable} from 'rxjs';
import {SolicitudCambioContrasenia} from '@models/solicitud-cambio-contrasenia.interface';
import {CambioContrasenia} from '@models/cambio-contrasenia.interface';

@Injectable({
  providedIn: 'root'
})
export class RecuperacionCredencialesService {
  private readonly URL_BASE: string = environment.api.login + 'auth/';
  private readonly URL_CAMBIO_CONTRASENIA: string = 'solicitud-cambio-contrasena';
  private readonly URL_ACTUALIZAR_CONTRASENIA: string = 'cambio-contrasena';

  http: HttpClient = inject(HttpClient);

  solicitarCambioPass(solicitud: SolicitudCambioContrasenia): Observable<any> {
    return this.http.post(`${this.URL_BASE}${this.URL_CAMBIO_CONTRASENIA}`, solicitud)
  }

  cambiarPass(solicitud: CambioContrasenia, token: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`);
    headers = headers.set('Content-Type', 'application/json');

    const httpOptions = {headers: headers};

    return this.http.post(`${this.URL_BASE}${this.URL_ACTUALIZAR_CONTRASENIA}`, solicitud, httpOptions)
  }
}
