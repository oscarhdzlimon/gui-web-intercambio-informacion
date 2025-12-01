import {InjectionToken} from '@angular/core';
import {TiempoSesion} from '@models/tiempo-sesion.interface';

/*
 * Define el tiempo de inactividad en segundos para cerrar la sesión automaticamente'
 */
export const TIEMPO_MAXIMO_SESION = new InjectionToken<TiempoSesion>('Define el tiempo de inactividad ');
