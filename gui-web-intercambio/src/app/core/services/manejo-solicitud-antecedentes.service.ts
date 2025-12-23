import {Injectable} from '@angular/core';
import {SolicitudAsociacion} from '../interfaces/solicitud-asociacion.interface';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ManejoSolicitudAntecedentesService {

  private registros = new Map<string, SolicitudAsociacion>();

  private cambiosSubject =
    new BehaviorSubject<Map<string, SolicitudAsociacion>>(this.registros);

  cambios$ = this.cambiosSubject.asObservable();

  agregar(key: string, solicitud: SolicitudAsociacion): void {
    console.log('agregar', key)
    this.registros.set(key, solicitud);
    this.cambiosSubject.next(this.registros);
  }

  eliminar(key: string): void {
    this.registros.delete(key);
    console.log('eliminar', key)
    this.cambiosSubject.next(this.registros);
  }

  existe(key: string): boolean {
    return this.registros.has(key);
  }

  obtenerRegistros(): SolicitudAsociacion[] {
    return Array.from(this.registros.values());
  }

  limpiar(): void {
    this.registros.clear();
  }

  tieneRegistros(): boolean {
    return this.registros.size > 0;
  }
}
