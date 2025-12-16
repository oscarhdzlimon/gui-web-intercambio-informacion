import {TipoDropdown} from '@models/tipo-dropdown.interface';

export const CME_TOKEN: string = "token";

export const TIPO_CONSULTA_ANTECEDENTES: TipoDropdown[] = [
  {label: 'NSS', value: 1},
  {label: 'Nombre y apellidos', value: 2},
  {label: 'Ambos', value: 3},
]

export const FILTRO_RESULTADOS_EXPEDIENTE: TipoDropdown[] = [
  {label: 'NSS', value: 1},
  {label: 'Nombre y apellidos', value: 2},
]
