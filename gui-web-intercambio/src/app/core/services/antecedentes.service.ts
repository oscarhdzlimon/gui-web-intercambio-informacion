import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment.development';
import {SolicitudAntecedentes} from '../interfaces/solicitud-antecedentes.interface';
import {SolicitudAsociacion} from '../interfaces/solicitud-asociacion.interface';

@Injectable({
  providedIn: 'root'
})
export class AntecedentesService {
  private readonly URL_BASE: string = environment.api.apiAntecedentes + 'antecedentes';
  private readonly URL_BITACORA: string = environment.api.apiBitacora + 'bitacora';

  http: HttpClient = inject(HttpClient);

  getLstAntecedentes(size: number, page: number, solicitud: SolicitudAntecedentes) {
    const params = new HttpParams();
    params.append('size', size);
    params.append('page', page);

    return this.http.post<any>(`${this.URL_BASE}/General`, solicitud, {params});
  }

  getTotalAntecedentes(solicitud: SolicitudAntecedentes) {
    return this.http.post<any>(`${this.URL_BASE}/totales`, solicitud);
  }

  getExpediente(expediente: string) {
    return this.http.post<any>(`${this.URL_BASE}/expediente/personas`, {expediente});
  }

  guardarAsociacion(solicitud: SolicitudAsociacion[]) {
    return this.http.post<any>(`${this.URL_BITACORA}/asociacion`, solicitud);
  }

}
