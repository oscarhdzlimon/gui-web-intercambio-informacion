import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { Observable, catchError, map, throwError } from 'rxjs';
import { SolicitudAntecedentes } from '../interfaces/solicitud-antecedentes.interface';
import { DetalleAntecedentes } from '@models/detalleAntecedentes.interface';
import { ReporteAntecedentes } from '@models/reporteAntecedentes.interface';

@Injectable({
  providedIn: 'root',
})
export class ReporteAntecedentesService {
  private readonly serverAntecedentes = environment.api.apiAntecedentes;

  header = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  constructor(private http: HttpClient) {}

  descargaExcelHistoricoDocs(
    solicitud: ReporteAntecedentes
  ): Observable<any> {
    const ruta = `${this.serverAntecedentes}antecedentes/reporte/antecedentes`;
    const options = { headers: this.header };
    return this.http.post<any>(ruta, solicitud, options).pipe(
      catchError(this.handleError),
      map((response: any) => {
        return response;
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.log('Error ' + error.status + '. Contácte al administrador');
    // Return an observable with a user-facing error message.
    return throwError(error);
  }
}
