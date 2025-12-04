import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnDefinition } from '@models/columa-tabla';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { NAV } from '@utils/url-global';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tabla-acordeon',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule,
    NgbAccordionModule,FormsModule
  ],
  templateUrl: './tabla-acordeon.component.html',
  styleUrl: './tabla-acordeon.component.scss'
})
export class TablaAcordeonComponent {
  protected _router: Router;
 _nav = NAV;
@Input() titulo: string = '';
 @Input() data: any[] = [];
  

  @Input() rows: number = 10;
  @Input() first: number = 0;
  @Input() total: number = 0;

  @Output() pageChange = new EventEmitter<any>();
  @Output() checkboxChanged = new EventEmitter<{ row: any, column: ColumnDefinition }>();
  constructor() {
     this._router = inject(Router);
   }
   onPageChange(event: any) {
    this.pageChange.emit(event);
   
}
 ngOnInit() {
  console.log('total',this.total);
 }
 ver(){
   this._router.navigate(['/privado', NAV.detalleAntecedentes]);
 }
}
