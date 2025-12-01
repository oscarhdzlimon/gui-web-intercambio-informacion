import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import { DictamenRespuesta } from '@models/dictamen-respuesta.interface';
import { OpinionTecnicaRespuesta } from '@models/opnion-tecnia-respuesta.interface';
import { VerificacionDocsExcelInterface } from '@models/verificacion-docs-excel.interface';
import {VerificacionDocsInterface} from '@models/verificacion-docs.interface';
import {Observable, catchError, map, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerificacionDocsService {
  private readonly serverVerificacionDocs = environment.api.apiConvocatoria;
  header = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  constructor(private http: HttpClient) {
  }

  consultarDocs(filtros: VerificacionDocsInterface): Observable<any> {

    let parametros = new HttpParams();

    Object.entries(filtros).forEach(
      ([key, valor]) => {
        if (valor !== null && valor !== undefined && valor !== '') {
          parametros = parametros.set(key, valor.toString());
        }
      });

    const ruta = `${this.serverVerificacionDocs}/verificacion/consultaVerificacionDocumentos`;
    return this.http.get<any>(ruta, {headers: this.header, params: parametros}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  /* descargaExcelHistoricoDocs(filtros: VerificacionDocsExcelInterface): Observable<any> {

    let parametros = new HttpParams();

    Object.entries(filtros).forEach(
      ([key, valor]) => {
        if (valor !== null && valor !== undefined && valor !== '') {
          parametros = parametros.set(key, valor.toString());
        }
      });

    const ruta = `${this.serverVerificacionDocs}/verificacion/consultaVerificacionDocumentosHistorico`;
    return this.http.get<any>(ruta, {headers: this.header, params: parametros}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  } */

    descargaExcelHistoricoDocs(filtros: VerificacionDocsExcelInterface): Observable<Blob> {

    let parametros = new HttpParams();
    // ... (construcción de parámetros) ...
    Object.entries(filtros).forEach(
      ([key, valor]) => {
        if (valor !== null && valor !== undefined && valor !== '') {
          parametros = parametros.set(key, valor.toString());
        }
      });


    const ruta = `${this.serverVerificacionDocs}/verificacion/consultaVerificacionDocumentosHistorico`;
    
    
    return this.http.get(ruta, { 
        headers: this.header, 
        params: parametros,
        responseType: 'blob' 
    }).pipe(
        
        catchError(this.handleError),
    );
}

descargarDictamen(idusuario: number): Observable<DictamenRespuesta> {
    const ruta = `${this.serverVerificacionDocs}/verificacion/descargarDictamen/${idusuario}`;
    
    // responseType se omite o se deja por defecto ('json')
    return this.http.get<DictamenRespuesta>(ruta, { 
        headers: this.header,
    }).pipe(
        // Ya no transformamos a Blob aquí. Solo manejamos errores.
        catchError(this.handleError),
    );
}

descargarOpinion(idusuario: number): Observable<OpinionTecnicaRespuesta> {
    const ruta = `${this.serverVerificacionDocs}/verificacion/descargarOpinionTecnica/${idusuario}`;
    
    // responseType se omite o se deja por defecto ('json')
    return this.http.get<OpinionTecnicaRespuesta>(ruta, { 
        headers: this.header,
    }).pipe(
        // Ya no transformamos a Blob aquí. Solo manejamos errores.
        catchError(this.handleError),
    );
}
  consultarPerfilDetalle(id: number): Observable<any> {
    const ruta = `${this.serverVerificacionDocs}/verificacion/aspirante/verificacion-documentos/${id}`;
    const options = { headers: this.header };
    return this.http.get<any>(ruta, options).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  verificarRegistro(solicitud: any):Observable<any> {
    const ruta = `${this.serverVerificacionDocs}/verificacion/aspirante/verificacion-documentos`
    const options = { headers: this.header };
    return this.http.post<any>(ruta, solicitud, options).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  private handleError(error: HttpErrorResponse) {

    console.log("Error " + error.status + '. Contácte al administrador');
    // Return an observable with a user-facing error message.
    return throwError(error);
  }
}
