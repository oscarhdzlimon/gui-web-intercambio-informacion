import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {environment} from '@env/environment.development';
import {AlertService} from './alert.service';
import {Observable, catchError, map, throwError} from 'rxjs';
import {HttpRespuesta} from '@models/http-respuesta.interface';
import {DetalleAntecedenteInterface} from '@models/detalle-antecedente.interface';
import {ParametrosInterface} from '@models/parametros.interface';
import {ResponseGeneral} from '@models/responseGeneral';
import {DetalleAntecedentes} from '@models/detalleAntecedentes.interface';
import {SolicitudBusquedaPaginado} from '../interfaces/solicitud-busqueda-antecedentes.interface';

interface datosUsuario {
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string
  nss: string,
  tipoBusqueda: string,
}

@Injectable({
  providedIn: 'root'
})
export class DetalleAntecedentesService {

  private readonly serverEndPointURLAntecedente = `${environment.api.apiAntecedentes}`;

  http: HttpClient = inject(HttpClient);
  _alertServices: AlertService = inject(AlertService);

  header: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST',
  });

  consultarGestion(body: datosUsuario): Observable<any> {

    const ruta = `${this.serverEndPointURLAntecedente}antecedentes/Detalle/Gestion`;
    return this.http.post<HttpRespuesta<any>>(ruta, body, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    );
  }


  consultarFechasCorte(filtros: DetalleAntecedenteInterface | SolicitudBusquedaPaginado, tipoBusqueda: number = 1): Observable<HttpRespuesta<any>> {
    const ruta = `${this.serverEndPointURLAntecedente}antecedentes/obtenerFechasCorte`;

    const params = new HttpParams()
      .set('tipoBusqueda', tipoBusqueda);

    if (!tipoBusqueda) {
      return this.http.post<HttpRespuesta<any>>(ruta, filtros, {headers: this.header})
    }

    return this.http.post<HttpRespuesta<any>>(ruta, filtros, {headers: this.header, params}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    );
  }


  private handleError(error: ResponseGeneral) {
    if (!error.exito) {
      this._alertServices.error("Error: " + error.mensaje ? error.mensaje : '. Contácte al administrador');
      console.log("Error: " + error.mensaje ? error.mensaje : '. Contácte al administrador');
      // Return an observable with a user-facing error message.

    }
    return throwError(error);
  }
}
