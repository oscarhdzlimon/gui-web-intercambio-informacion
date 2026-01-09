import {CommonModule, Location} from '@angular/common';
import {Component, signal, WritableSignal,} from '@angular/core';

import {ReactiveFormsModule,} from '@angular/forms';
import {GeneralComponent} from '@components/general.component';
import {ButtonModule} from 'primeng/button';
import {Card} from 'primeng/card';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {PaginatorModule} from 'primeng/paginator';
import {PopoverModule} from 'primeng/popover';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {
  TablaAmparoIndirecto,
  TablaDetalleGestionInterface,
  TablaInconformidades,
  TablaJuicioContenciosoInterface,
  TablaProcedimientoRpeInterface,
  TablaQuejaMedicaInterface,
} from '@models/tablas-detalle-antecedentes.interface';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {DetalleComponent} from './detalle/detalle.component';
import {FooterGenericoComponent} from '../../shared/footer-generico/footer-generico.component';
import {HeaderGenericoComponent} from '../../shared/header-generico/header-generico.component';
import {ActivatedRoute} from '@angular/router';
import {DetalleAntecedentesService} from '@services/detalle-antecedentes.service';
import {Ordenamiento} from '@models/ordenamiento.enum';
import {forkJoin} from 'rxjs';
import {DataCacheService} from '@services/data-cache.service';
import { DetalleAntecedentes } from '@models/detalleAntecedentes.interface';

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
  ],
  templateUrl: './detalle-antecedentes.component.html',
  styleUrl: './detalle-antecedentes.component.scss',
  providers: [DialogService],
})
export class DetalleAntecedentesComponent extends GeneralComponent {
  idpagina: number = 0;
  ruta = this._nav.consultaantecedentes;
  titulo = 'Antecedentes';

  lstGestion: WritableSignal<TablaDetalleGestionInterface[]> = signal([]);
  lstQueja: WritableSignal<TablaQuejaMedicaInterface[]> = signal([]);
  lstInconformidad: WritableSignal<TablaInconformidades[]> = signal([]);
  lstAmparo: WritableSignal<TablaAmparoIndirecto[]> = signal([]);
  lstProcedimientoRpe: WritableSignal<TablaProcedimientoRpeInterface[]> =
    signal([]);
  lstJuicio: WritableSignal<TablaJuicioContenciosoInterface[]> = signal([]);

  fechasCorte: DetalleAntecedentes = {
    fecCorteSiade: "",
    fecCorteSsc1: "",
    fecCorteSsc2: "",
    nss: ""
  };

  estatusPendienteDocumentacion = false;

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


  datosUsuario = {
    nombre: 'ANGEL ARMANDO  BRAVO ZAMBRANO',
    nss: '48068225530',
    expediente: '0923/2020-27',
    id:''
  };

  constructor(
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private detalleAntecedentesService: DetalleAntecedentesService,
    private readonly dataCacheService: DataCacheService,
    private _location: Location
  ) {
    super();
    this.route.paramMap.subscribe((params) => {
      const cacheId = params.get('id');
      this.datosUsuario.id = cacheId!;

      if (cacheId) {
        // 1. Recuperar el objeto completo del caché
        const datosRecuperados = this.dataCacheService.retrieveData(cacheId);

        if (datosRecuperados) {
          console.log('Datos cargados desde el caché:', datosRecuperados);
          this.datosUsuario = datosRecuperados;
        } else {
          // Manejo de error si el ID no se encuentra (Ej: al refrescar sin datos guardados)
          console.warn(
            'Advertencia: No se encontraron datos para el ID de caché:',
            cacheId
          );
          this.regresar();
        }

        // this.iniciarCargaDeDatos();
      }
    });
  }

  tabla!: Array<any>;
  tabla2!: Array<any>;

  ngOnInit(): void {
    this.llenarTablas();

    this.idpagina = Number(this.route.snapshot.paramMap.get('id'));
  }

  llenarTablas() {
    const parametros = { page: 0, size: 10, sort: Ordenamiento.ASC };
    forkJoin({
      gestionData: this.detalleAntecedentesService.consultarGestion(
        parametros,
        this.datosUsuario.id
      ),
      quejaMedicaData: this.detalleAntecedentesService.consultarQuejaMedica(
        parametros,
        this.datosUsuario.id
      ),
      inconformidadesData:
        this.detalleAntecedentesService.consultarInconformidad(
          parametros,
          this.datosUsuario.id
        ),
      amparoIndirectoData:
        this.detalleAntecedentesService.consultarAmparoIndirecto(
          parametros,
          this.datosUsuario.id
        ),
      procedimientoRpeData:
        this.detalleAntecedentesService.consultarProcedimiento(
          parametros,
          this.datosUsuario.id
        ),
      juicioContenciosoData:
        this.detalleAntecedentesService.consultarJuicioContencioso(
          parametros,
          this.datosUsuario.id
        ),
     /* fechasCorte: 
        this.detalleAntecedentesService.consultarFechasCorte(
          this.datosUsuario
        )*/
    }).subscribe({
      next: ({
        gestionData,
        quejaMedicaData,
        inconformidadesData,
        amparoIndirectoData,
        procedimientoRpeData,
        juicioContenciosoData,
        //fechasCorte
      }) => {
        this.lstGestion.set(gestionData.content);
        this.totalElementosGestion = gestionData.page.totalElements;

        this.lstQueja.set(quejaMedicaData['content']);
        this.totalElementosQueja = quejaMedicaData['page'].totalElements;

        this.lstInconformidad.set(inconformidadesData['content']);
        this.totalElementosInconformidad =
          inconformidadesData['page'].totalElements;

        this.lstAmparo.set(amparoIndirectoData['content']);
        this.totalElementosAmparoIndirecto =
          amparoIndirectoData['page'].totalElements;

        this.lstProcedimientoRpe.set(procedimientoRpeData['content']);
        this.totalElementosProcedimientoRpe =
          procedimientoRpeData['page'].totalElements;

        this.lstJuicio.set(juicioContenciosoData['content']);
        this.totalElementosJuicio = juicioContenciosoData['page'].totalElements;

        //this.fechasCorte = fechasCorte.respuesta
      },
    });
  }

  public btnVerDetalle(
    registro: TablaDetalleGestionInterface,
    idRegistro: number,
    titulo: string
  ) {
    const dtosUsuario = this.datosUsuario;
    this.ref = this.dialogService.open(DetalleComponent, {
      data: { ...registro, titulo, dtosUsuario },
      modal: true,
      width: '40vw',
      height: '80vh',
      focusOnShow: false,
      breakpoints: {
        '360px': '75vw',
        '340px': '40vw',
      },
      templates: {
        footer: FooterGenericoComponent,
        header: HeaderGenericoComponent,
      },
      styleClass: 'oferta-detail',
    });
  }

  onPageChange(event: any, from: string) {
    if (from == 'quejaMedica') {
      this.paginaActualQueja = event.page;
      this.firstQueja = event.first;
      this.paginarQueja();
    }

    if (from == 'inconformidad') {
      this.paginaActualInconformidad = event.page;
      this.firstInconformidad = event.first;
      this.paginarInconformidad();
    }

    if (from == 'amparoIndirecto') {
      this.paginaActualAmparoIndirecto = event.page;
      this.firstAmparoIndirecto = event.first;
      this.paginarAmparoIndirecto();
    }

    if (from == 'procedimientoRpe') {
      this.paginaActualProcedimientoRpe = event.page;
      this.firstProcedimientoRpe = event.first;
      this.paginarProcedimientoRpe();
    }

    if (from == 'juicio') {
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

  paginarQueja() {
    const parametros = {
      page: this.paginaActualQueja,
      size: 10,
      sort: Ordenamiento.ASC,
    };

    this.detalleAntecedentesService
      .consultarQuejaMedica(parametros, this.datosUsuario.id)
      .subscribe({
        next: (datos) => {
          this.lstQueja.set(datos['content']);
          this.totalElementosQueja = datos['page'].totalElements;
        },
      });
  }

  paginarGestion() {
    const parametros = {
      page: this.paginaActualGestion,
      size: 10,
      sort: Ordenamiento.ASC,
    };

    this.detalleAntecedentesService
      .consultarGestion(parametros, this.datosUsuario.id)
      .subscribe({
        next: (datos) => {
          this.lstGestion.set(datos.content);
          this.totalElementosGestion = datos.page.totalElements;
        },
      });
  }

  paginarInconformidad() {
    const parametros = {
      page: this.paginaActualInconformidad,
      size: 10,
      sort: Ordenamiento.ASC,
    };

    this.detalleAntecedentesService
      .consultarInconformidad(parametros, this.datosUsuario.id)
      .subscribe({
        next: (datos) => {
          this.lstInconformidad.set(datos['content']);
          this.totalElementosInconformidad = datos['page'].totalElements;
        },
      });
  }

  paginarAmparoIndirecto() {
    const parametros = {
      page: this.paginaActualAmparoIndirecto,
      size: 10,
      sort: Ordenamiento.ASC,
    };

    this.detalleAntecedentesService
      .consultarAmparoIndirecto(parametros, this.datosUsuario.id)
      .subscribe({
        next: (datos) => {
          this.lstAmparo.set(datos['content']);
          this.totalElementosAmparoIndirecto = datos['page'].totalElements;
        },
      });
  }

  paginarProcedimientoRpe() {
    const parametros = {
      page: this.paginaActualProcedimientoRpe,
      size: 10,
      sort: Ordenamiento.ASC,
    };

    this.detalleAntecedentesService
      .consultarProcedimiento(parametros, this.datosUsuario.id)
      .subscribe({
        next: (datos) => {
          this.lstProcedimientoRpe.set(datos['content']);
          this.totalElementosProcedimientoRpe = datos['page'].totalElements;
        },
      });
  }

  paginarJuicio() {
    const parametros = {
      page: this.paginaActualJuicio,
      size: 10,
      sort: Ordenamiento.ASC,
    };

    this.detalleAntecedentesService
      .consultarJuicioContencioso(parametros, this.datosUsuario.id)
      .subscribe({
        next: (datos) => {
          this.lstJuicio.set(datos['content']);
          this.totalElementosJuicio = datos['page'].totalElements;
        },
      });
  }

  cargarPagina(event: any) {
    console.log('Paginación:', event);
  }
  cambiarEstado(event: any) {
    console.log('Checkbox cambiado:', event);
  }

  regresar() {
    this._location.back();
  }
}
