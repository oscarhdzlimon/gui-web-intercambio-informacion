import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {NuevaSolicitudBusquedaPaginado} from '../interfaces/solicitud-busqueda-antecedentes.interface';

export interface FiltrosBusqueda {
  filtro: string | null;
  valor: string | null;
  consulta_todos: boolean;
}

export interface FiltrosAntecedentes {
  tipoconsulta: number | null;
  nss: string | null;
  nombre: string | null;
  apaterno: string | null;
  amaterno: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BusquedaStateService {

  private readonly PAGINACION_KEY = 'paginacion_antecedentes';

  // Almacena el estado actual de los filtros
  private filtrosSource = new BehaviorSubject<NuevaSolicitudBusquedaPaginado | null>(null);

  private filtrosAntecedentes = new BehaviorSubject<NuevaSolicitudBusquedaPaginado | null>(null);

  private paginasTablas = new BehaviorSubject<Record<string, number>>({});

  filtrosActuales$: Observable<NuevaSolicitudBusquedaPaginado | null> = this.filtrosSource.asObservable();

  filtrosAntecedentesActuales$: Observable<NuevaSolicitudBusquedaPaginado | null> = this.filtrosAntecedentes.asObservable();

  constructor() {
  }

  /**
   * Guarda los filtros de la última consulta.
   * @param filtros El objeto de filtros a guardar.
   */
  guardarFiltros(filtros: NuevaSolicitudBusquedaPaginado): void {
    this.filtrosSource.next(filtros);
  }

  guardarFiltrosAntecedentes(filtros: NuevaSolicitudBusquedaPaginado): void {
    this.filtrosAntecedentes.next(filtros);
  }

  eliminarFiltros() {
    this.filtrosSource.next(null);
    this.filtrosAntecedentes.next(null);
  }

  /**
   * Obtiene los filtros actuales de forma síncrona.
   */
  obtenerFiltros(): NuevaSolicitudBusquedaPaginado | null {
    return this.filtrosSource.getValue();
  }

  obtenerFiltrosAntecedentes(): NuevaSolicitudBusquedaPaginado | null {
    return this.filtrosAntecedentes.getValue();
  }

  guardarPaginaTabla(idTabla: string, pagina: number): void {
    const paginas = this.paginasTablas.getValue();
    paginas[idTabla] = pagina;
    this.paginasTablas.next(paginas);
  }

  obtenerPaginaTabla(idTabla: string): number {
    console.log(idTabla, this.paginasTablas.getValue()[idTabla])
    return this.paginasTablas.getValue()[idTabla] || 0;
  }

  limpiarPaginasTablas(): void {
    this.paginasTablas.next({});
  }

  guardarPaginasAntecedentes(nssPage: number, nombrePage: number): void {
    const paginas = { nssPage, nombrePage };
    sessionStorage.setItem(this.PAGINACION_KEY, JSON.stringify(paginas));
  }

  obtenerPaginasAntecedentes(): { nssPage: number, nombrePage: number } | null {
    const data = sessionStorage.getItem(this.PAGINACION_KEY);
    return data ? JSON.parse(data) : null;
  }

  limpiarEstadoCompleto(): void {
    sessionStorage.removeItem(this.PAGINACION_KEY);
    this.eliminarFiltros();
  }
}
