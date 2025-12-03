import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnDefinition } from '@models/columa-tabla';
import { NAV } from '@utils/url-global';
import { ButtonModule } from 'primeng/button';
import { Card, CardModule } from 'primeng/card';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-tabla-principal',
  standalone: true,
  imports: [ CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,FormsModule],
  templateUrl: './tabla-principal.component.html',
  styleUrl: './tabla-principal.component.scss'
})
export class TablaPrincipalComponent {
protected _router: Router;
 _nav = NAV;

  @Input() titulo: string = '';
  @Input() data: any[] = [];
  

  @Input() rows: number = 10;
  @Input() first: number = 0;
  @Input() total: number = 0;

  @Output() pageChange = new EventEmitter<any>();
  @Output() checkboxChanged = new EventEmitter<{ row: any, column: ColumnDefinition }>();
  tituloTabla: string = 'Resultados de la búsqueda'; 
  // 🔒 Columnas congeladas
  frozenColumns: ColumnDefinition[] = [];

  // 🔓 Columnas normales
  unfrozenColumns: ColumnDefinition[] = [];
totalWidth:any;
  // Definición fija de columnas
  columns: ColumnDefinition[] = [
    { field: 'asociar', header: 'Asociar', width: '80px', checkbox: true },
    { field: 'nss', header: 'NSS', width: '150px' },
    { field: 'nombre', header: 'Nombre', width: '200px' },
    { field: 'apaterno', header: 'Apellido paterno', width: '200px' },
    { field: 'amaterno', header: 'Apellido materno', width: '200px' },
    { field: 'gestion', header: 'Gestión', width: '150px' },
    { field: 'queja', header: 'Queja médica', width: '150px' },
    { field: 'inconformidades', header: 'Inconformidades', width: '150px' },
    { field: 'amparo', header: 'Amparo Indirecto', width: '150px' },
    { field: 'procedimiento', header: 'Procedimiento RP', width: '150px' },
    { field: 'juicio', header: 'Juicio Contencioso Administrativo Federal', width: '150px' },
  ];
// Propiedad para controlar si la tabla debe ser desplazable
  esPantallaGrande: boolean = true;
  // Define el punto de quiebre (breakpoint) para considerar 'móvil'
  readonly TABLET_BREAKPOINT = 992; // El estándar 'lg' en PrimeFlex/Bootstrap

  constructor(private cd: ChangeDetectorRef) {
     this._router = inject(Router);
   }
  ngOnInit() {
  console.log('TablaPrincipalComponent initialized with data:', this.data);
  const dynamicWidth = this.columns
    .map(c => parseInt(c.width))
    .reduce((a, b) => a + b, 0);
console.log('titulo',this.titulo);
  const fixedWidth = 200; // 100px + 100px de las columnas fijas
  this.totalWidth = dynamicWidth + fixedWidth;
  this.checkScreenSize();
  //this.tituloTabla=this.tituloTabla + this.titulo;
}
@HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }



  // Detecta cambios cuando el padre cambia las columnas
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      
    }
  }

ver(){
  this._router.navigate(['/privado', NAV.detalleAntecedentes]);
}

  // Evento paginador
  onPageChange(event: any) {
    this.pageChange.emit(event);
  }

  // Evento checkbox
onCheckboxEvent(row: any, col: any, event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.checked;

  row[col.field] = value;
  this.checkboxChanged.emit({ row, column: col });
}

onCheckboxChange(row: any, col: ColumnDefinition) {
  this.checkboxChanged.emit({ row, column: col });
}

visualizar(row: any) {
  console.log('Visualizar:', row);
  // Aquí tu lógica: abrir modal, navegar, etc.
}

imprimir(row: any) {
  console.log('Imprimir:', row);
  // Aquí tu lógica: exportar, imprimir, etc.
}
// 2. Lógica para determinar si es pantalla grande
  checkScreenSize(): void {
    // Si el ancho de la ventana es mayor al punto de quiebre
    const nuevoEstado = window.innerWidth >= this.TABLET_BREAKPOINT;

    if (this.esPantallaGrande !== nuevoEstado) {
      this.esPantallaGrande = nuevoEstado;
      // Forzar la detección de cambios para actualizar las propiedades de la tabla
      this.cd.detectChanges();
    }
  }

}
