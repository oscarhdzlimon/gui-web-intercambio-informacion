import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  lstGestion=[];
  estatusPendienteDocumentacion =false;
  public eliminar(row: number){}

}
