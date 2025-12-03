import { Component, OnInit } from '@angular/core';
import { TablaDetalleGestionInterface } from '@models/table-detalle-gestion.interface';
import {DynamicDialogConfig,DynamicDialogRef} from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-detalle',
  imports: [ButtonModule],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class DetalleComponent implements OnInit {

  constructor(public ref: DynamicDialogRef,
    public readonly data: DynamicDialogConfig,

) {

}
strTitulo ="";
registro!:TablaDetalleGestionInterface;
ngOnInit() {

  if (this.data?.data) {
    this.strTitulo = this.data.data.titulo;
    this.registro = this.data.data.idRegistro;
    console.log(this.data);
  }


}


}
