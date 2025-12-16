import {RegistroAntecedentes} from './registro-antecedentes.interface';
import {WritableSignal} from '@angular/core';

enum TipoTabla {
  NSS = 'NSS',
  NOMBRE = 'NOMBRE'
}

export interface ResultadoConsulta {
  tipo: TipoTabla;
  tituloBase: string;
  tituloCompleto: string;
  data: WritableSignal<RegistroAntecedentes[]>;
  paginaActual: number;
  registrosPorPagina: number;
  totalRegistros: number;
  valorBusqueda: string | null;
}
