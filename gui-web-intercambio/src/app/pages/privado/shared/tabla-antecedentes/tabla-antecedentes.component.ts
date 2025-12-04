import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColumnDefinition } from '@models/columa-tabla';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { FooterGenericoComponent } from '../footer-generico/footer-generico.component';
import { HeaderGenericoComponent } from '../header-generico/header-generico.component';
import { DetalleComponent } from '@pages/privado/pages/detalle-antecedentes/detalle/detalle.component';

@Component({
  selector: 'app-tabla-antecedentes',
  standalone: true,
  imports: [CommonModule,

    TableModule,
    PaginatorModule,
  FormsModule],
  templateUrl: './tabla-antecedentes.component.html',
  styleUrl: './tabla-antecedentes.component.scss'
})
export class TablaAntecedentesComponent {

 @Input() data: any[] = [];
  

  @Input() rows: number = 10;
  @Input() first: number = 0;
  @Input() total: number = 0;
  @Input() tabla: number = 0;
  

  @Output() pageChange = new EventEmitter<any>();
  @Output() checkboxChanged = new EventEmitter<{ row: any, column: ColumnDefinition }>();
  ref: DynamicDialogRef | undefined;
  constructor(
      public dialogService: DialogService) {
      
     
    }

  onPageChange(event: any) {
    this.pageChange.emit(event);
   
}
 ngOnInit() {
  console.log('total',this.total);
 }
 ver(){

  let idRegistro:number=0;
  let registro:any={consecutivo:1,folio:'GES240015',persona:'Ricardo Palma García',peticionarios:'PAGR890101HDFRRC01',nss:'17482569321',fecha:'15-03-2022',ooad:'OOAD Ciudad de México Norte',unidad:'HGZ No. 24 Insurgentes',estado:'Concluido',cierre:'25-04-2022'};
   let titulo= 'Detalle de: Gestión';
      this.ref = this.dialogService.open(DetalleComponent, {
        data: {...registro,idRegistro, titulo},
        modal: true,
        width: '768px',
        height: '440px',
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
