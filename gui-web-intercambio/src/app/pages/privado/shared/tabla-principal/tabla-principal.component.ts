import {CommonModule} from '@angular/common';
import {ChangeDetectorRef, Component, EventEmitter, HostListener, inject, input, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {ColumnDefinition} from '@models/columa-tabla';
import {NAV} from '@utils/url-global';
import {ButtonModule} from 'primeng/button';
import {Card} from 'primeng/card';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {PaginatorModule} from 'primeng/paginator';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {RegistroAntecedentes} from '../../../../core/interfaces/registro-antecedentes.interface';
import {DataCacheService} from '@services/data-cache.service';
import {ReporteAntecedentesService} from '@services/reporteAntecedentes.service';
import {DetalleAntecedentes} from '@models/detalleAntecedentes.interface';
import { ReporteAntecedentes } from '@models/reporteAntecedentes.interface';

@Component({
  selector: 'app-tabla-principal',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule, FormsModule],
  templateUrl: './tabla-principal.component.html',
  styleUrl: './tabla-principal.component.scss'
})
export class TablaPrincipalComponent {
  protected _router: Router;
  _nav = NAV;

  @Input() titulo: string = '';
  @Input() tipoBusqueda: string = '';
  @Input() showTitulo: boolean = true;
  @Input() expediente: string | null = null;
  @Input() datosUsuario!: ReporteAntecedentes;
  @Input() asociar: boolean = true

  @Input() rows: number = 10;
  @Input() first: number = 0;
  @Input() total: number = 0;

  readonly data = input<RegistroAntecedentes[]>([]);

  @Output() pageChange = new EventEmitter<any>();
  @Output() checkboxChanged = new EventEmitter<any>();

  dataCacheService: DataCacheService = inject(DataCacheService);
  reporteAntecedentesService: ReporteAntecedentesService = inject(ReporteAntecedentesService);

  // Definición fija de columnas
  columns: ColumnDefinition[] = [
    {field: 'asociar', header: 'Asociar', width: '80px', checkbox: true},
    {field: 'nss', header: 'NSS', width: '150px'},
    {field: 'nombre', header: 'Nombre', width: '200px'},
    {field: 'apaterno', header: 'Apellido paterno', width: '200px'},
    {field: 'amaterno', header: 'Apellido materno', width: '200px'},
    {field: 'gestion', header: 'Gestión', width: '150px'},
    {field: 'queja', header: 'Queja médica', width: '150px'},
    {field: 'inconformidades', header: 'Inconformidades', width: '150px'},
    {field: 'amparo', header: 'Amparo Indirecto', width: '150px'},
    {field: 'procedimiento', header: 'Procedimiento RP', width: '150px'},
    {field: 'juicio', header: 'Juicio Contencioso Administrativo Federal', width: '150px'},
  ];
  // Propiedad para controlar si la tabla debe ser desplazable
  esPantallaGrande: boolean = true;
  // Define el punto de quiebre (breakpoint) para considerar 'móvil'
  readonly TABLET_BREAKPOINT = 992; // El estándar 'lg' en PrimeFlex/Bootstrap

  currentQueryParams: { [key: string]: any } = {};

  constructor(private cd: ChangeDetectorRef,
              private readonly route: ActivatedRoute) {
    this._router = inject(Router);
    this.leerInformacionUsuario();
  }

  leerInformacionUsuario(): void {
    this.route.queryParamMap.subscribe(params => {
      this.currentQueryParams = {};

      // Mapear los queryParams a un objeto simple
      params.keys.forEach(key => {
        const value = params.get(key);
        if (value !== null) {
          this.currentQueryParams[key] = value;
        }
      });

      if (!params) return;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  ver(registro: RegistroAntecedentes): void {

    const navigationExtras: NavigationExtras = {
      queryParams: {
        ...this.currentQueryParams,
        tipoBusqueda: this.tipoBusqueda,
        nss: registro.nss,
        n: registro.nombre,
        ap: registro.apellidoPaterno,
        am: registro.apellidoMaterno
      },
      queryParamsHandling: 'merge'
    };

    // Navegar usando el UUID como parámetro posicional
    void this._router.navigate(['/privado', NAV.detalleAntecedentes], navigationExtras);
  }

  generarPdf(registro: RegistroAntecedentes) {
    const obj: ReporteAntecedentes = {
      ...this.datosUsuario,
      tipoBusqueda: +this.tipoBusqueda,
      nombre: registro.nombre,
      apellidoPaterno: registro.apellidoPaterno,
      apellidoMaterno: registro.apellidoMaterno,
      nss: registro.nss,
      expediente: this.expediente
    }

    this.reporteAntecedentesService.descargaExcelHistoricoDocs(obj).subscribe({

      next: (datos) => {
        if (datos.adjuntoBase64) {
          const base64 = datos.adjuntoBase64;
          const nombreArchivo = datos.nombreAdjunto || 'Reporte Antecedentes.pdf';
          const contentType = 'application/pdf';
          const pdfBlob = this.b64toBlob(base64, contentType);
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        }
      }
    });
  }

  private b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512): Blob {

    let base64 = b64Data.split(',')[1] ? b64Data.split(',')[1] : b64Data;

    // Eliminar CUALQUIER carácter que NO sea una letra/número válido para Base64,
    // incluyendo espacios, saltos de línea, y caracteres de control.
    // Base64 válido solo incluye A-Z, a-z, 0-9, +, / y = (relleno).
    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');

    try {
      const byteCharacters = atob(base64);

      const byteArrays: Uint8Array[] = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays as BlobPart[], {type: contentType});

    } catch (e) {
      // Si incluso después de la limpieza falla, la respuesta NO es Base64.
      console.error("Error crítico: La respuesta HTTP no es un Base64 válido.", e);
      // Lanza un error genérico o notifica al usuario.
      throw new Error("El string Base64 no es válido o contiene caracteres ilegales.");
    }
  }

  // Evento paginador
  onPageChange(event: any) {
    console.log(event)
    event.page++;
    this.pageChange.emit(event);
  }

  // Evento checkbox
  onCheckboxEvent(row: any, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.checked;
    console.log(row, event)
    this.checkboxChanged.emit(row);
  }

  onCheckboxChange(row: any, col: ColumnDefinition) {
    this.checkboxChanged.emit(row);
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

  protected readonly event = event;
}
