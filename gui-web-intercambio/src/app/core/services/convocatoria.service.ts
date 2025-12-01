import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AspiranteRequest, InteresLaboralRequest} from '@models/aspirante';
import {DataFotografia} from '@models/fotografia';
import {DatosDocumentoResponse} from '@models/datosDocumento';
import {ContactoRequest, DataContacto} from '@models/datosContacto';

import {DataDomicilio, ResidenciaRequest} from '@models/datosDomicilio';
import {AlertService} from './alert.service';
import {dataGenerales, DatosGeneralesRequest} from '@models/datosGenerales';
import {ResponseGeneral} from '@models/responseGeneral';
import {SolicitudGuardarDocumentacion} from '@models/solicitud-guardar-documentacion.interface';
import {FiltrosPLazaInterface} from '@models/filtros-plaza.interface';
import {HttpRespuesta} from '@models/http-respuesta.interface';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaService {
  private readonly serverEndPointURLConvocatoria = `${environment.api.apiConvocatoria}`;
  private readonly serverEndPointURLDocumento = `${environment.api.apiDocumentos}`;

  http: HttpClient = inject(HttpClient);
  _alertServices: AlertService = inject(AlertService);

  header: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  headers2: HttpHeaders = new HttpHeaders({

    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST',

  });


  getDatosResidencia(idUsuario: number): Observable<any> {
    return this.http.get<DataDomicilio>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-residencia/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: DataDomicilio) => {
        return response;
      })
    );
  }

  getDatosDependientes(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-dependientes/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }


  getDatosEmpleo(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-empleo/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  getDatosGenerales(idUsuario: number): Observable<dataGenerales> {
    return this.http.get<dataGenerales>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-generales/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: dataGenerales) => {
        return response;
      })
    );
  }


  getDatosContacto(idUsuario: number): Observable<any> {
    return this.http.get<DataContacto>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-contacto/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: DataContacto) => {
        return response;
      })
    );
  }


  getDatosInteresLaboral(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-interes-laboral/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  getDatosFotografia(idUsuario: number): Observable<DataFotografia> {
    return this.http.get<any>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-fotografia/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: DataFotografia) => {
        return response;
      })
    );
  }


  getDatosDocumentos(idUsuario: number): Observable<any> {
    return this.http.get<DatosDocumentoResponse>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-documentos/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: DatosDocumentoResponse) => {
        return response;
      })
    );
  }

  getDatosDocumentosEscolares(idUsuario: number): Observable<any> {
    return this.http.get<DatosDocumentoResponse>(`${this.serverEndPointURLConvocatoria}/aspirante/datos-documentos-escolaridad/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: DatosDocumentoResponse) => {
        return response;
      })
    );
  }


  getVerificacionAspirante(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.serverEndPointURLConvocatoria}/verificacion/aspirante/${idUsuario}`, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  getEvaluacionDocumentos(idUsuario: number): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/verificacion/aspirante/evaluacion-documentos/${idUsuario}`;
    return this.http.get<any>(ruta, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  guardarDatosGenerales(aspirante: DatosGeneralesRequest): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/datos-generales`;
    return this.http.post<any>(ruta, aspirante, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  guardarDatosDocumentosEscolares(solicitud: SolicitudGuardarDocumentacion): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/datos-documentos-escolaridad`;
    return this.http.post<any>(ruta, solicitud, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  terminarRegistro(solicitud: SolicitudGuardarDocumentacion): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/finalizar-datos-documentos-escolaridad`;
    return this.http.post<any>(ruta, solicitud, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }


  guardarVerificacionAspirante(aspirante: AspiranteRequest): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/verificacion/aspirante'`;
    return this.http.post<any>(ruta, aspirante, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  guardarFoto(foto: any): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/datos-fotografia`;
    return this.http.post<any>(ruta, foto, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }


  guardarDocumento(documento: any): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/datos-documentos`
    return this.http.post<any>(ruta, documento, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )


  }

  guardarInteresLaboral(interes: InteresLaboralRequest): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/datos-interes-laboral`
    return this.http.post<any>(ruta, interes, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )


  }

  guardarContacto(datosContacto: ContactoRequest): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/datos-contacto`
    return this.http.post<any>(ruta, datosContacto, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )


  }

  guardarResidencia(residencia: ResidenciaRequest): Observable<any> {
    let ruta = `${this.serverEndPointURLConvocatoria}/aspirante/datos-residencia`
    return this.http.post<any>(ruta, residencia, {headers: this.header}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )


  }

  consultarPlazas(filtros: any, parameters: any): Observable<any> {

    const {page, size, sort} = parameters;

    let parametros = new HttpParams();
    parametros = parametros.set('page', page);
    parametros = parametros.set('size', size);
    parametros = parametros.set('sort', sort);


    const ruta = `${this.serverEndPointURLConvocatoria}/plazas/consultar`;
    return this.http.post<any>(ruta, filtros, {headers: this.header, params: parametros}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  consultarTotales(
    filtros: {
      cveEspecialidad: string | null,
      cveOoad: string | null,
      cveBono: string | null,
      regimen: string | null,
      cveZona: string | null
    }
  ): Observable<HttpRespuesta<any>> {

    return this.http.post<HttpRespuesta<any>>(`${this.serverEndPointURLConvocatoria}/plazas/consultar/totales`, filtros).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  consultarTotalesFavoritos(
    filtros: {
      cveEspecialidad: string | null,
      cveOoad: string | null,
      cveBono: string | null,
      regimen: string | null,
      cveZona: string | null,
      idUsuario: number
    }
  ): Observable<HttpRespuesta<any>> {

    return this.http.post<HttpRespuesta<any>>(`${this.serverEndPointURLConvocatoria}/plazas-favoritas/consultar/totales`, filtros).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  agregarFavorito(
    datosPlaza: {
      idUsuario: number,
      idPlaza: number,
      esFavorita: boolean
    }
  ): Observable<HttpRespuesta<any>> {
    return this.http.post<HttpRespuesta<any>>(`${this.serverEndPointURLConvocatoria}/plazas-favoritas/guardar`, datosPlaza).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }


  consultarFavoritos(filtros: any, parameters: any): Observable<any> {

    const {page, size, sort} = parameters;

    let parametros = new HttpParams();
    parametros = parametros.set('page', page);
    parametros = parametros.set('size', size);
    parametros = parametros.set('sort', sort);


    const ruta = `${this.serverEndPointURLConvocatoria}/plazas-favoritas/consultar`;
    return this.http.post<any>(ruta, filtros, {headers: this.header, params: parametros}).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
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
