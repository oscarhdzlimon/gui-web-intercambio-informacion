import {Component, Input} from '@angular/core';
import {GeneralComponent} from '../general.component';

@Component({
  selector: 'btn-regresar',
  imports: [],
  templateUrl: './btn-regresar.component.html',
  styleUrl: './btn-regresar.component.scss'
})
export class BtnRegresarComponent extends GeneralComponent {
  @Input() ruta!: any;

  public btnRegresar() {
    console.log("la ruta es: ", this.ruta);
    if (this.ruta) {
      void this._router.navigate([this.ruta]);
    } else {
      this._alertServices.informacion("Dev no ha ingresado la ruta de retorno");
    }

  }
}
