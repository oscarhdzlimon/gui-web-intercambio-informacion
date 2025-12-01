import {TipoDropdown} from '@models/tipo-dropdown.interface';

export function mapearArregloTipoDropdown(arr: any[] = [], label: string = '', value: string = ''): TipoDropdown[] {
  return arr.map(obj => ({
    label: obj[label],
    value: obj[value]
  }));
}
