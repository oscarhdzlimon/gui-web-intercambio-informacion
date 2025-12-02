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
  styleUrl: './detalle-antecedentes.component.scss'
})
export class DetalleAntecedentesComponent extends GeneralComponent {

  ruta= this._nav.consultaantecedentes;
  titulo = 'Antecedentes';

  lstGestion: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  estatusPendienteDocumentacion =false;
  

  
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

  public btnVerGestion(idRegistro:number){

  }

}
