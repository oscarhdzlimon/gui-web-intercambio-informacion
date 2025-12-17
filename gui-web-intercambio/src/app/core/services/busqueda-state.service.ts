import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

export interface FiltrosBusqueda {
  filtro: string | null;
  valor: string | null;
  consulta_todos: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BusquedaStateService {

  // Almacena el estado actual de los filtros
  private filtrosSource = new BehaviorSubject<FiltrosBusqueda | null>(null);

  filtrosActuales$: Observable<FiltrosBusqueda | null> = this.filtrosSource.asObservable();

  constructor() {
  }

  /**
   * Guarda los filtros de la última consulta.
   * @param filtros El objeto de filtros a guardar.
   */
  guardarFiltros(filtros: FiltrosBusqueda): void {
    this.filtrosSource.next(filtros);
  }

  /**
   * Obtiene los filtros actuales de forma síncrona.
   */
  obtenerFiltros(): FiltrosBusqueda | null {
    return this.filtrosSource.getValue();
  }
}
