import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {EstatusDocumentacion} from '@models/verificacion-documentos.interface';


@Component({
  selector: 'app-pill',
  imports: [CommonModule],
  templateUrl: './pill.component.html',
  styleUrl: './pill.component.scss'
})

export class PillComponent {

  @Input() texto: string = "No cumple con requisitos";
  @Input() pillType: number = 0;

  setClass(): string{
    return EstatusDocumentacion[this.pillType];
  }
}
