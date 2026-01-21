import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment.development';
import {SolicitudAntecedentes} from '../interfaces/solicitud-antecedentes.interface';
import {SolicitudAsociacion} from '../interfaces/solicitud-asociacion.interface';
import {SolicitudBitacora} from '../interfaces/solicitud-bitacora.inerface';
import {SolicitudBusquedaPaginado} from '../interfaces/solicitud-busqueda-antecedentes.interface';
import {ParamsAsociacion} from '../interfaces/params-asociacion.interface';
import {BusquedaInternaNombre, BusquedaInternaNombreNSS} from '../interfaces/consulta-interna-antecedentes.interface';

@Injectable({
  providedIn: 'root'
})
export class AntecedentesService {
  private readonly URL_BASE: string = environment.api.apiAntecedentes + 'antecedentes';
  private readonly URL_BITACORA: string = environment.api.apiBitacora + 'bitacora';
  private readonly URL_SSCV1: string = environment.api.sscv1 + 'actualizar';

  http: HttpClient = inject(HttpClient);

  getLstAntecedentes(size: number, page: number, solicitud: SolicitudBusquedaPaginado, tipoBusqueda: number = 1) {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('tipoBusqueda', tipoBusqueda);

    return this.http.post<any>(`${this.URL_BASE}/General`, solicitud, {params});
  }

  getTotalAntecedentes(solicitud: SolicitudAntecedentes | SolicitudBusquedaPaginado, tipoBusqueda: number = 1) {
    const params = new HttpParams()
      .set('tipoBusqueda', tipoBusqueda);

    if (!tipoBusqueda) {
      return this.http.post<any>(`${this.URL_BASE}/totales`, solicitud);
    }

    return this.http.post<any>(`${this.URL_BASE}/totales`, solicitud, {params});
  }

  guardarAsociacion(solicitud: SolicitudAsociacion[], paramsAsociacion: ParamsAsociacion) {
    const params = new HttpParams()
      .set('sistema', paramsAsociacion.sistema)
      .set('idModulo', paramsAsociacion.idModulo)
      .set('cveAsunto', paramsAsociacion.cveAsunto);
    return this.http.post<any>(`${this.URL_BITACORA}/asociacion`, solicitud, {params});
  }

  guardarBitacora(solicitud: SolicitudBitacora) {
    return this.http.post<any>(`${this.URL_BITACORA}/consulta`, solicitud);
  }

  actualizarSSCV1(solicitud: any) {
    return this.http.post<any>(`${this.URL_SSCV1}`, solicitud);
  }

  getLstAntecedentesByNSS(nss: string) {
    const params = new HttpParams()
      .set('nss', nss);
    return this.http.get(`${this.URL_BASE}/busqueda-nss`, {params});
  }

  getLstAntecedentesByNombre({nombre, apPaterno, apMaterno}: BusquedaInternaNombre) {
    const params = new HttpParams()
      .set('nombre', nombre)
      .set('nombre', apPaterno)
      .set('nombre', apMaterno);

    return this.http.get(`${this.URL_BASE}/busqueda-nombre`, {params});
  }

  getLstAntecedentesByAmbos({nombre, apPaterno, apMaterno, nss}: BusquedaInternaNombreNSS) {
    const params = new HttpParams()
      .set('nss', nss)
      .set('nombre', nombre)
      .set('nombre', apPaterno)
      .set('nombre', apMaterno);

    return this.http.get(`${this.URL_BASE}/busqueda-ambos`, {params});
  }
}
