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
import { TablaAmparoIndirecto, TablaDetalleGestionInterface, TablaInconformidades, TablaJuicioContenciosoInterface, TablaProcedimientoRpeInterface, TablaQuejaMedicaInterface } from '@models/tablas-detalle-antecedentes.interface';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { DetalleComponent } from './detalle/detalle.component';
import { FooterGenericoComponent } from '../../shared/footer-generico/footer-generico.component';
import { HeaderGenericoComponent } from '../../shared/header-generico/header-generico.component';
import { TablaAntecedentesComponent } from '@pages/privado/shared/tabla-antecedentes/tabla-antecedentes.component';
import { NAV } from '@utils/url-global';
import { ActivatedRoute } from '@angular/router';
import { DetalleAntecedentesService } from '@services/detalle-antecedentes.service';
import { Ordenamiento } from '@models/ordenamiento.enum';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-detalle-antecedentes',
  imports: [  
    CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule,
    NgbAccordionModule,
    BtnRegresarComponent,
    TablaAntecedentesComponent
  ],
  templateUrl: './detalle-antecedentes.component.html',
  styleUrl: './detalle-antecedentes.component.scss',
  providers: [DialogService]
})
export class DetalleAntecedentesComponent extends GeneralComponent {

idpagina:number=0;
  ruta= this._nav.consultaantecedentes;
  titulo = 'Antecedentes';


  lstGestion: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  lstQueja: WritableSignal<TablaQuejaMedicaInterface[]> = signal([]);
  lstInconformidad: WritableSignal<TablaInconformidades[]> = signal([]);
  lstAmparo: WritableSignal<TablaAmparoIndirecto[]> = signal([]);
  lstProcedimientoRpe: WritableSignal<TablaProcedimientoRpeInterface[]> = signal([]);
  lstJuicio: WritableSignal<TablaJuicioContenciosoInterface[]> = signal([]);
  
  estatusPendienteDocumentacion =false;
  
  ref: DynamicDialogRef | undefined;

  paginaActual: number = 0;
  first: number = 0;
  totalElementos: number = 0;
  rows: number = 10;
  

  paginaActualGestion: number = 0;
  firstGestion: number = 0;
  totalElementosGestion: number = 0;

  paginaActualQueja: number = 0;
  firstQueja: number = 0;
  totalElementosQueja: number = 0;

  paginaActualInconformidad: number = 0;
  firstInconformidad: number = 0;
  totalElementosInconformidad: number = 0;
  
  paginaActualAmparoIndirecto: number = 0;
  firstAmparoIndirecto: number = 0;
  totalElementosAmparoIndirecto: number = 0;

  paginaActualProcedimientoRpe: number = 0;
  firstProcedimientoRpe: number = 0;
  totalElementosProcedimientoRpe: number = 0;

  paginaActualJuicio: number = 0;
  firstJuicio: number = 0;
  totalElementosJuicio: number = 0;


  //Gestión
  /*
    {
      "nombre": "ANGEL ARMANDO  BRAVO ZAMBRANO", 
      "nss": "48068225530",
      "expediente": "0923/2020-27"
    }
  */

  //Queja médica
  /*
  {
    "nombre": "ANGEL ARMANDO  BRAVO ZAMBRANO", 
    "nss": "48068225530",
    "expediente": "0923/2020-27"
  }
  */

  //Inconformidad
  /*
    {
      "nombre": "SANJUANA VEGA SIFUENTES", 
      "nss": "43886827680",
      "expediente": "CC.NL.-0621/2016"
    }
  */

  //Amparo indirecto
  /*
  {
    "nombre": "ANGEL ARMANDO  BRAVO ZAMBRANO", 
    "nss": "48068225530",
    "expediente": "0923/2020-27"
  }
  */


  //procedimiento rpe
  /*
  {
    "nombre": "RAUL  HERNANDEZ AMADOR", 
    "nss": "13896904235",
    "expediente": "0001/2020"
  }
  
  */

  //Juicio contencioso
  /*
  {
  "nombre": "LUIS ADRIAN ARIZPE DELGADO", 
  "nss": "4312880790",
  "expediente": "000403/2021-06-02-5"
}
  
  */


  datosUsuario =   {
    "nombre": "ANGEL ARMANDO  BRAVO ZAMBRANO", 
    "nss": "48068225530",
    "expediente": "0923/2020-27"
  }
    





  constructor(
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private detalleAntecedentesService: DetalleAntecedentesService
    ) {
    super();
   
  }

  tabla!: Array<any>;
  tabla2!: Array<any>;




  

  ngOnInit(): void {

    this.llenarTablas();
  

  

  
 
  this.idpagina= Number(this.route.snapshot.paramMap.get('id'));
  
 
   
  }



  llenarTablas(){

    const parametros = {page:0,size:10,sort:Ordenamiento.ASC};
    forkJoin({
      gestionData: this.detalleAntecedentesService.consultarGestion(parametros,this.datosUsuario),
      quejaMedicaData: this.detalleAntecedentesService.consultarQuejaMedica(parametros,this.datosUsuario),
      inconformidadesData: this.detalleAntecedentesService.consultarInconformidad(parametros,this.datosUsuario),
      amparoIndirectoData: this.detalleAntecedentesService.consultarAmparoIndirecto(parametros,this.datosUsuario),
      procedimientoRpeData: this.detalleAntecedentesService.consultarProcedimiento(parametros,this.datosUsuario),
      juicioContenciosoData: this.detalleAntecedentesService.consultarJuicioContencioso(parametros,this.datosUsuario),
    }).subscribe({
      next:({gestionData,quejaMedicaData,inconformidadesData,amparoIndirectoData,procedimientoRpeData,juicioContenciosoData}) => {
        this.lstGestion.set(gestionData.content);
        this.totalElementosGestion = gestionData.page.totalElements;

        this.lstQueja.set(quejaMedicaData['content']);
        this.totalElementosQueja = quejaMedicaData['page'].totalElements;

        this.lstInconformidad.set(inconformidadesData['content'])
        this.totalElementosInconformidad = inconformidadesData['page'].totalElements;

        this.lstAmparo.set(amparoIndirectoData['content']);
        this.totalElementosAmparoIndirecto =  amparoIndirectoData['page'].totalElements;

        this.lstProcedimientoRpe.set(procedimientoRpeData['content']);
        this.totalElementosProcedimientoRpe = procedimientoRpeData['page'].totalElements;

        this.lstJuicio.set(juicioContenciosoData['content']);
        this.totalElementosJuicio = juicioContenciosoData['page'].totalElements;
      
      }
    })
  }






  public btnVerDetalle(registro: TablaDetalleGestionInterface,idRegistro:number, titulo: string){
    
    
    this.ref = this.dialogService.open(DetalleComponent, {
      data: {...registro, titulo},
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



  onPageChange(event:any, from: string){
    

    

      if(from == 'quejaMedica'){

        this.paginaActualQueja = event.page;
        this.firstQueja = event.first;
        this.paginarQueja();
      }

      if(from == 'inconformidad'){

        this.paginaActualInconformidad = event.page;
        this.firstInconformidad = event.first;
        this.paginarInconformidad();
      }

      if(from == 'amparoIndirecto'){
        this.paginaActualAmparoIndirecto = event.page;
        this.firstAmparoIndirecto = event.first;
        this.paginarAmparoIndirecto();
      }
      
      
      if(from == 'procedimientoRpe'){
        this.paginaActualProcedimientoRpe = event.page;
        this.firstProcedimientoRpe = event.first;
        this.paginarProcedimientoRpe();
      }

      if(from == 'juicio'){
        this.paginaActualJuicio = event.page;
        this.firstJuicio = event.first;
        this.paginarJuicio();
      }
      

    
  }


  onPageChangeGestion(event: any): void {
    
    if (event.page) {
      this.paginaActualGestion = event.page;
    }
    this.firstGestion = event.first;
    this.paginarGestion(); 
  }

  paginarQueja(){
    const parametros = {page:this.paginaActualQueja,size:10,sort:Ordenamiento.ASC};
    
    this.detalleAntecedentesService.consultarQuejaMedica(parametros,this.datosUsuario)
    .subscribe({
      next:(datos) => {
        this.lstQueja.set(datos['content']);
        this.totalElementosQueja = datos['page'].totalElements;
      }
    });
  }

  paginarGestion() {

    const parametros = {page:this.paginaActualGestion,size:10,sort:Ordenamiento.ASC};
    
    this.detalleAntecedentesService.consultarGestion(parametros,this.datosUsuario)
    .subscribe({
      next:(datos) => {
        this.lstGestion.set(datos.content);
        this.totalElementosGestion = datos.page.totalElements;
      }
      
    });
  }




  paginarInconformidad(){

    const parametros = {page:this.paginaActualInconformidad,size:10,sort:Ordenamiento.ASC};
    
    this.detalleAntecedentesService.consultarInconformidad(parametros,this.datosUsuario)
    .subscribe({
      next:(datos) => {
        this.lstInconformidad.set(datos['content']);
        this.totalElementosInconformidad = datos['page'].totalElements;
      }
    });
  }

  paginarAmparoIndirecto(){

    const parametros = {page:this.paginaActualAmparoIndirecto,size:10,sort:Ordenamiento.ASC};
    
    this.detalleAntecedentesService.consultarAmparoIndirecto(parametros,this.datosUsuario)
    .subscribe({
      next:(datos) => {
        this.lstAmparo.set(datos['content']);
        this.totalElementosAmparoIndirecto = datos['page'].totalElements;
      }
    });

  }


  paginarProcedimientoRpe() {
    const parametros = {page:this.paginaActualProcedimientoRpe,size:10,sort:Ordenamiento.ASC};
    
    this.detalleAntecedentesService.consultarProcedimiento(parametros,this.datosUsuario)
    .subscribe({
      next:(datos) => {
        this.lstProcedimientoRpe.set(datos['content']);
        this.totalElementosProcedimientoRpe = datos['page'].totalElements;
      }
    });
  }

  paginarJuicio() {
    const parametros = {page:this.paginaActualJuicio,size:10,sort:Ordenamiento.ASC};
    
    this.detalleAntecedentesService.consultarJuicioContencioso(parametros,this.datosUsuario)
    .subscribe({
      next:(datos) => {
        this.lstJuicio.set(datos['content']);
        this.totalElementosJuicio = datos['page'].totalElements;
      }
    });
  }








     cargarPagina(event: any) {
    console.log("Paginación:", event);
  }
  cambiarEstado(event: any) {
    console.log("Checkbox cambiado:", event);
  }

  regresar(){
    if(this.idpagina==1){
this._router.navigate(['/privado', NAV.consultaantecedentes]);
    }else{
      this._router.navigate(['/privado', NAV.busquedasistema]);
    }
    
  }
}
