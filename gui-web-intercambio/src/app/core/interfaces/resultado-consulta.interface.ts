import {RegistroAntecedentes} from './registro-antecedentes.interface';
import {WritableSignal} from '@angular/core';
import {NombreTipoDropdown} from './nombre-tipo-dropdown.interface';

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
  valorBusqueda: string | NombreTipoDropdown;
  esPaginadoManual?: boolean,
  datosCompletosFiltrados?: RegistroAntecedentes[],
}

