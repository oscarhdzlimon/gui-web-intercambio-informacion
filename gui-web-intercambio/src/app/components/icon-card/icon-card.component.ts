import {Component, Input} from '@angular/core';

@Component({
  selector: 'icon-card',
  imports: [],
  templateUrl: './icon-card.component.html',
  styleUrl: './icon-card.component.scss'
})
export class IconCardComponent {
  @Input() iconClass: string = 'pi pi-user'; // Clase del icono (por defecto, pi-user)
  @Input() cardColor: string = '#ff8f01'; // Color principal (por defecto, naranja)
  @Input() bgColor: string = '#ff8f01'; // Color principal (por defecto, naranja)
  @Input() leftBorderRound: boolean = false; // Opcional: borde redondo inferior izquierda

  // Opcional: para un color de fondo con opacidad
  get backgroundColor() {
    return this.hexToRgbA(this.bgColor, 1);
  }

  // Función para convertir HEX a RGBA para el fondo
  private hexToRgbA(hex: string, alpha: number) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return `rgba(${[(+c >> 16) & 255, (+c >> 8) & 255, +c & 255].join(',')},${alpha})`;
    }
    throw new Error('Bad Hex');
  }
}
