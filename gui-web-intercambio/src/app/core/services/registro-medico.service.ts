/**
 * Develop: Ameyalli Victoria S
 * 2025
 */
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import {RegistroCurpRequest, RegistroInternoRequest, RegistroPasaporteRequest} from '@models/datosMedico';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {AlertService} from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class RegistroMedicoService {
  private readonly VERSION_API: string = '/v1/';
  private readonly serverEndPointURL = environment.api.apiCatalogos + this.VERSION_API;
  private readonly serverEndPointURRegistro = environment.api.apiRegistro;
  alertas = inject(AlertService);
  header = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  constructor(private http: HttpClient) { }




  registrarResidente(residente: RegistroInternoRequest): Observable<any> {
    let ruta = `${this.serverEndPointURRegistro}/registro`
    return this.http.post<RegistroInternoRequest>(ruta, residente, { headers: this.header }).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  registrarPasaporte(residente: RegistroPasaporteRequest): Observable<any> {
    let ruta = `${this.serverEndPointURRegistro}/registro`
    return this.http.post<RegistroPasaporteRequest>(ruta, residente, { headers: this.header }).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }

  registrarCurp(residente: RegistroCurpRequest): Observable<any> {
    let ruta = `${this.serverEndPointURRegistro}/registro`
    return this.http.post<RegistroCurpRequest>(ruta, residente, { headers: this.header }).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response
      }),
    )
  }
  getDatosByMatricula(datos: any): Observable<any> {
    return this.http.post<any>(`${this.serverEndPointURRegistro}/validacion/medico-interno`, datos, { headers: this.header }).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  getDatosByCurp(datos: any): Observable<any> {
    return this.http.post<any>(`${this.serverEndPointURRegistro}/validacion/medico-externo`, datos, { headers: this.header }).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }


  private handleError(error: HttpErrorResponse) {

   console.log("Error " + error.status + '. Contácte al administrador');
    // Return an observable with a user-facing error message.
    return throwError(error);
  }


}
