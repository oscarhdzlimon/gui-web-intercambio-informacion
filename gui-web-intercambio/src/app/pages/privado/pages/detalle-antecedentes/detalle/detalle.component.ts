import { Component, OnInit, inject } from '@angular/core';
import { TablaDetalleGestionInterface } from '@models/tablas-detalle-antecedentes.interface';
import {DynamicDialogConfig,DynamicDialogRef} from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { UserService } from '@services/user.service';
import { SesionUser } from '@models/sesion-user.interface';
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
userService = inject(UserService);
userData: SesionUser | null = null;

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

datosDetalle: any;


ngOnInit() {
  this.userService.userData$.subscribe(user => this.userData = user);

  this.userData;
  if (this.data?.data) {

    this.strTitulo = this.data.data.titulo;
    this.datosDetalle = this.data.data;
    this.registro = this.data.data.idRegistro;
    this.consecutivo = this.data.data.consecutivo;
    this.folio = this.data.data.folio;
    this.persona = this.data.data.persona;
    this.peticionarios = this.data.data.nombrePeticionario;
    this.nss = this.data.data.nss;
    this.fecha = this.data.data.fechaCreacion;
    this.ooad = this.data.data.ooadInvolucrado;
    this.unidad = this.data.data.unidad;
    this.estado = this.data.data.estado;
    this.cierre = this.data.data.fechaCierre;
  }
    
  }


}



