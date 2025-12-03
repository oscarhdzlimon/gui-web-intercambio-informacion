import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GeneralComponent } from '@components/general.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { TablaAcordeonComponent } from '@pages/privado/shared/tabla-acordeon/tabla-acordeon.component';
import { TablaPrincipalComponent } from '@pages/privado/shared/tabla-principal/tabla-principal.component';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-busqueda-sistemas',
  imports: [CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule,TablaAcordeonComponent,NgbAccordionModule],
  templateUrl: './busqueda-sistemas.component.html',
  styleUrl: './busqueda-sistemas.component.scss'
})
export class BusquedaSistemasComponent extends GeneralComponent implements OnInit {
   tituloTabla: string = '';
   data:any[] = [
  ];
  totalRecords: number = 0;
   data2:any[] = [
  ];
  totalRecords2: number = 0;

  data3:any[] = [
  ];
  totalRecords3: number = 0;


  ngOnInit(): void {
    this.inicializatablaNSS1();
    this.inicializatablaNSS2();
    this.inicializatabla3();
  }

  inicializatablaNSS1(){
    this.data = [
  { asociar: false,nss:"17482569321",nombre: "Ricardo", apaterno: "Palma", amaterno:"García",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
  { asociar: false,nss:"17482569321",nombre: "Ricardo", apaterno: "Palma", amaterno:"López",gestion:2,queja:1,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
];
this.tituloTabla = 'Resultados de la búsqueda por NSS: 17482569321';
this.totalRecords = this.data.length;
}

 inicializatablaNSS2(){
    this.data2 = [
  { asociar: false,nss:"17482569321",nombre: "Ricardo", apaterno: "Palma", amaterno:"García",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
];
this.tituloTabla = 'Resultados de la búsqueda por NSS: 17482569321';
this.totalRecords2 = this.data2.length;
}

inicializatabla3(){
    this.data3 = [
  { asociar: false,nss:"17482569321",nombre: "Ricardo", apaterno: "Palma", amaterno:"García",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
  { asociar: false,nss:"17482569321",nombre: "Ricardo", apaterno: "Palma", amaterno:"López",gestion:2,queja:1,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
  { asociar: false,nss:"17482569321",nombre: "Ricardo", apaterno: "Palma", amaterno:"Hernández",gestion:2,queja:1,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
];
this.tituloTabla = 'Resultados de la búsqueda por NSS: 17482569321';
this.totalRecords3 = this.data3.length;
}
  

   cargarPagina(event: any) {
    console.log("Paginación:", event);
  }
  cambiarEstado(event: any) {
    console.log("Checkbox cambiado:", event);
  }
   


}
