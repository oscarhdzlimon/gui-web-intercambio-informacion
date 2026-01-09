import {RegistroAntecedentes} from './registro-antecedentes.interface';
import {WritableSignal} from '@angular/core';

enum TipoTabla {
  NSS = '1',
  NOMBRE = '2'
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
