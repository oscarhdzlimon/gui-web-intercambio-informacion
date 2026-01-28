import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreModulo',
  standalone: true
})
export class NombreModuloPipe implements PipeTransform {
  private modulos: Record<number, string> = {
    1: 'Inconformidades',
    2: 'Responsabilidad Patrimonial',
    3: 'Juicio RPE',
    4: 'Amparo Indirecto',
    5: 'Gestión',
    6: 'Quejas UDH'
  };

  transform(value: number | string): string {
    const id = Number(value);
    return this.modulos[id] || 'Módulo no encontrado';
  }
}
