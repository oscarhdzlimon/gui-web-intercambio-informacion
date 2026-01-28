import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreSistema',
  standalone: true // Si usas Standalone Components
})
export class NombreSistemaPipe implements PipeTransform {
  private sistemas: Record<number, string> = {
    1: 'SSCV1',
    2: 'SSCV2',
    3: 'SIADE'
  };

  transform(value: number | string): string {
    const id = Number(value);
    return this.sistemas[id] || 'Sistema no encontrado';
  }
}
