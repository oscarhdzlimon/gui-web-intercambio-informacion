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

  BtnRegresarComponent],
  templateUrl: './detalle-antecedentes.component.html',
  styleUrl: './detalle-antecedentes.component.scss',
  providers: [DialogService]
})
export class DetalleAntecedentesComponent extends GeneralComponent {

  ruta= this._nav.consultaantecedentes;
  titulo = 'Antecedentes';

  lstGestion: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  estatusPendienteDocumentacion =false;
  
  ref: DynamicDialogRef | undefined;
  
  constructor(
    public dialogService: DialogService) {
    super();
   
  }

  
  ngOnInit(): void {
   let reg1 ={
    idConsecutivo: 1,
    idExpediente: 'ABCDFE',
    personaPromovente: "Ameyalli Victoria Sarmiento",
    strCurp: 'VISA900901MTLCRM00',
    strNSS: '031708259993',
    fchSuceso: '02/12/2025',
    strDescripcionSuceso: 'los hechos ocurrieron de tal forma que uno se sorprende al leerlos',
   }
   let tabla  =[];
   tabla.push(reg1);
   this.lstGestion.set(tabla);
  }

  public btnVerGestion(idRegistro:number, registro:any){
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

}
