import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';

import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { BtnRegresarComponent } from '@components/btn-regresar/btn-regresar.component';
import { GeneralComponent } from '@components/general.component';
import { Tipoconsulta } from '@models/tipo-consulta';
import { TipoDropdown } from '@models/tipo-dropdown.interface';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { NgbAccordionModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TablaDetalleGestionInterface } from '@models/table-detalle-gestion.interface';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { DetalleComponent } from './detalle/detalle.component';
import { FooterGenericoComponent } from '../../shared/footer-generico/footer-generico.component';
import { HeaderGenericoComponent } from '../../shared/header-generico/header-generico.component';
import { TablaAntecedentesComponent } from '@pages/privado/shared/tabla-antecedentes/tabla-antecedentes.component';
import { NAV } from '@utils/url-global';
@Component({
  selector: 'app-detalle-antecedentes',
  imports: [  CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule,
    NgbAccordionModule,

  BtnRegresarComponent,TablaAntecedentesComponent],
  templateUrl: './detalle-antecedentes.component.html',
  styleUrl: './detalle-antecedentes.component.scss',
  providers: [DialogService]
})
export class DetalleAntecedentesComponent extends GeneralComponent {

  ruta= this._nav.consultaantecedentes;
  titulo = 'Antecedentes';
   data:any[] = [
  ];
  data2:any[] = [
  ];
  data4:any[] = [
  ];
  data5:any[] = [
  ];
  data6:any[] = [
  ];


  lstGestion: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  lstQueja: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  lstInconformidad: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  lstAmparo: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  lstJuicio: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  estatusPendienteDocumentacion =false;
  
  ref: DynamicDialogRef | undefined;

  paginaActual: number = 0;
  first: number = 0;
  totalElementos: number = 0;
  rows: number = 4;
  
  constructor(
    public dialogService: DialogService) {
    super();
   
  }

  tabla!: Array<TablaDetalleGestionInterface>;
  tabla2!: Array<TablaDetalleGestionInterface>;
  ngOnInit(): void {
    this.inicializatablagestion();
    this.inicializatablaamparo();
    this.inicializatablaprocedimiento();
   let reg1 ={
    idConsecutivo: 1,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg2 ={
    idConsecutivo: 2,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg3 ={
    idConsecutivo: 3,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg4 ={
    idConsecutivo: 4,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg5 ={
    idConsecutivo: 5,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg6 ={
    idConsecutivo: 6,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg7 ={
    idConsecutivo: 7,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg8 ={
    idConsecutivo: 8,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg9 ={
    idConsecutivo: 0,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg10 ={
    idConsecutivo: 10,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let reg11 ={
    idConsecutivo: 11,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   this.tabla =Array<TablaDetalleGestionInterface>();
   this.tabla2 =Array<TablaDetalleGestionInterface>();
   this.tabla.push(reg1);
   this.tabla.push(reg2);
   this.tabla.push(reg3);
   this.tabla.push(reg4);
   this.tabla.push(reg5);
   this.tabla.push(reg6);
   this.tabla.push(reg7);
   this.tabla.push(reg8);
   this.tabla.push(reg9);
   this.tabla.push(reg10);
   this.tabla2.push(reg11);
   this.lstGestion.set(this.tabla);
   this.lstQueja.set(this.tabla2);
   this.paginar();
  }

    inicializatablagestion(){
    this.data = [
  { consecutivo: 1,expediente:"GST2023001",persona:"Ricardo Palma García",curp:"PAGR830521HDFRLC05",nss:"17482569321",fecha: "20-03-2022", descripcion: "El promovente manifestó retraso en ...", ooad:"OOAD Ciudad de México Norte",unidad:"HGZ No. 24 Insurgentes",notificacion:"20-03-2022",estado:"En trámite",cierre:"20-03-2022",resolucion:"20-03-2022",acuerdo:"20-03-2022",revoco:"Sí - 20-03-2022"} ,
  { consecutivo: 1,expediente:"GST2023001",persona:"Ricardo Palma García",curp:"PAGR830521HDFRLC05",nss:"17482569321",fecha: "20-03-2022", descripcion: "El promovente manifestó retraso en ...", ooad:"OOAD Ciudad de México Norte",unidad:"HGZ No. 24 Insurgentes",notificacion:"20-03-2022",estado:"En trámite",cierre:"20-03-2022",resolucion:"20-03-2022",acuerdo:"20-03-2022",revoco:"Sí - 20-03-2022"} ,
];

}
 inicializatablaamparo(){
    this.data4 = [
  { consecutivo: 1,expediente:"GST2023001",persona:"Ricardo Palma García",peticionarios:"Ricardo Palma Hernández, María Fernanda ...",nss:"17482569321",fecha: "20-03-2022", descripcion: "El promovente manifestó retraso en ...", ooad:"OOAD Ciudad de México Norte",unidad:"HGZ No. 24 Insurgentes",notificacion:"20-03-2022",estado:"En trámite",cierre:"20-03-2022",resolucion:"20-03-2022",acuerdo:"20-03-2022",revoco:"Sí - 20-03-2022"} ,
  { consecutivo: 1,expediente:"GST2023001",persona:"Ricardo Palma García",peticionarios:"Ricardo Palma Vázquez, Claudia Méndez ...",nss:"17482569321",fecha: "20-03-2022", descripcion: "El promovente manifestó retraso en ...", ooad:"OOAD Ciudad de México Norte",unidad:"HGZ No. 24 Insurgentes",notificacion:"20-03-2022",estado:"En trámite",cierre:"20-03-2022",resolucion:"20-03-2022",acuerdo:"20-03-2022",revoco:"Sí - 20-03-2022"} ,
];

}
 inicializatablaprocedimiento(){
    this.data5 = [
  { consecutivo: 1,expediente:"GST2023001",persona:"Ricardo Palma García",peticionarios:"Ricardo Palma Hernández, María Fernanda ...",nss:"17482569321",fecha: "20-03-2022", descripcion: "El promovente manifestó retraso en ...", ooad:"OOAD Ciudad de México Norte",unidad:"HGZ No. 24 Insurgentes",notificacion:"20-03-2022",estado:"En trámite",cierre:"20-03-2022",resolucion:"20-03-2022",acuerdo:"20-03-2022",revoco:"Sí - 20-03-2022",convenio:"Sí"} ,
  { consecutivo: 1,expediente:"GST2023001",persona:"Ricardo Palma García",peticionarios:"Ricardo Palma Vázquez, Claudia Méndez ...",nss:"17482569321",fecha: "20-03-2022", descripcion: "El promovente manifestó retraso en ...", ooad:"OOAD Ciudad de México Norte",unidad:"HGZ No. 24 Insurgentes",notificacion:"20-03-2022",estado:"En trámite",cierre:"20-03-2022",resolucion:"20-03-2022",acuerdo:"20-03-2022",revoco:"Sí - 20-03-2022",convenio:"No"} ,
];

}
ver(){}

  public btnVerDetalle(idRegistro:number, registro:any){
    let titulo= 'Detalle de Gestión';
    this.ref = this.dialogService.open(DetalleComponent, {
      data: {...registro,idRegistro, titulo},
      modal: true,
      width: '40vw',
      height: '80vh',
      focusOnShow: false,
      breakpoints: {
        '360px': '75vw',
        '340px': '40vw'
      },
      templates: {
        footer: FooterGenericoComponent,
        header: HeaderGenericoComponent
            },
      styleClass: 'oferta-detail'
    });
  }


  onPageChange(event: any): void {
 this.first = event.first;
    this.rows = event.rows;
    this.paginaActual = event.page;
    this.paginar(); 
  }

  paginar() {
    this.lstGestion.set(this.tabla);
    //this.first = 0;
    this.totalElementos =     this.lstGestion().length;
    /* this.verificacionDocsService.consultarDocs(this.filtros()).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.usuarioDocumentos.set(respuesta.respuesta['content']);

        //this.first: number = 0;
        this.totalElementos = respuesta.respuesta.page.totalElements;
      }
    }) */
  }
     cargarPagina(event: any) {
    console.log("Paginación:", event);
  }
  cambiarEstado(event: any) {
    console.log("Checkbox cambiado:", event);
  }

  regresar(){
    this._router.navigate(['/privado', NAV.consultaantecedentes]);
  }
}
