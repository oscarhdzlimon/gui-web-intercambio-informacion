import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AlertService} from './alert.service';
import {ResponseGeneral} from '@models/responseGeneral';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  private readonly serverEndPointURLDocumento = `${environment.api.apiDocumentos}`;

  http: HttpClient = inject(HttpClient);
  _alertServices: AlertService = inject(AlertService);


  headers: HttpHeaders = new HttpHeaders({

    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST',

  });

  header: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });


  guardarFoto(foto: FormData, idModulo: number, idUsuario: number): Observable<any> {
    const params = new HttpParams()
      .set('idModulo', idModulo)
      .set('idUsuario', idUsuario)


    let ruta = `${this.serverEndPointURLDocumento}/v1/documentos/repositorio/fotografia?` + params;
    return this.http.post<any>(ruta, foto, {headers: this.headers}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  getFotografia(refGuid: string): Observable<Blob> {
    return this.http.get(`${this.serverEndPointURLDocumento}/v1/documentos/repositorio/${refGuid}`, {
      headers: this.header,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  guardarDocumento(documento: FormData): Observable<any> {
    let ruta = `${this.serverEndPointURLDocumento}/v1/documentos/repositorio`;
    return this.http.post<any>(ruta, documento, {headers: this.headers}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  obtenerDocumento(refGuid: string): Observable<Blob> {
    return this.http.get(`${this.serverEndPointURLDocumento}/v1/documentos/repositorio/${refGuid}`, {
      headers: this.header,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  obtenerDocsPorOoad(refGuid: string): Observable<Blob> {
    return this.http.get(`${this.serverEndPointURLDocumento}/v1/ooad-documentos/${refGuid}`, {
      headers: this.header,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  obtenerDocSede(refGuid: string): Observable<Blob> {
    return this.http.get(`${this.serverEndPointURLDocumento}/v1/sedes-documento/${refGuid}`, {
      headers: this.header,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }


  private handleError(error: ResponseGeneral) {

    if (!error.exito) {

      console.log("Error: " + error.mensaje ? error.mensaje : '. Contácte al administrador');
      // Return an observable with a user-facing error message.

    }
    return throwError(error);
  }
}
