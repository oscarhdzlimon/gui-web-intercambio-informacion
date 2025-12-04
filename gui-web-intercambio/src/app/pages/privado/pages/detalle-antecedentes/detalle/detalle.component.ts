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
consecutivo!:number;
folio:string="";
persona:string="";
peticionarios:string="";
nss:string=""
fecha:string="";
ooad:string="";
unidad:string="";
estado:string="";
cierre:string="";
ngOnInit() {

  if (this.data?.data) {
    this.strTitulo = this.data.data.titulo;
    this.registro = this.data.data.idRegistro;
    this.consecutivo = this.data.data.consecutivo;
    this.folio = this.data.data.folio;
    this.persona = this.data.data.persona;
    this.peticionarios = this.data.data.peticionarios;
    this.nss = this.data.data.nss;
    this.fecha = this.data.data.fecha;
    this.ooad = this.data.data.ooad;
    this.unidad = this.data.data.unidad;
    this.estado = this.data.data.estado;
    this.cierre = this.data.data.cierre;
  }
    console.log(this.data);
  }


}



