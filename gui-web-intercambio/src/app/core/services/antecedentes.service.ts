import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment.development';
import {SolicitudAntecedentes} from '../interfaces/solicitud-antecedentes.interface';

@Injectable({
  providedIn: 'root'
})
export class AntecedentesService {
  private readonly URL_BASE: string = environment.api.login + 'antecedentes';

  http: HttpClient = inject(HttpClient);

  getLstAntecedentes(size: number, page: number, solicitud: SolicitudAntecedentes) {
    const params = new HttpParams();
    params.append('size', size);
    params.append('page', page);

    return this.http.post<any>(`${this.URL_BASE}/General/`, solicitud, {params});
  }

  getTotalAntecedentes(solicitud: SolicitudAntecedentes) {
    return this.http.post<any>(`${this.URL_BASE}/Totales`, solicitud);
  }

}
