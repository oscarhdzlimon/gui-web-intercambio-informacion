import {CommonModule, Location} from '@angular/common';
import {Component, computed, inject, OnInit, signal,} from '@angular/core';

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
import {TablaDetalleGestionInterface,} from '@models/tablas-detalle-antecedentes.interface';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {DetalleComponent} from './detalle/detalle.component';
import {FooterGenericoComponent} from '../../shared/footer-generico/footer-generico.component';
import {HeaderGenericoComponent} from '../../shared/header-generico/header-generico.component';
import {ActivatedRoute} from '@angular/router';
import {DetalleAntecedentesService} from '@services/detalle-antecedentes.service';
import {DataCacheService} from '@services/data-cache.service';
import {DetalleAntecedentes} from '@models/detalleAntecedentes.interface';
import {SesionUser} from '@models/sesion-user.interface';
import {UserService} from '@services/user.service';
import {ConsultaDescifrada} from '../../../../core/interfaces/consulta-descifrada.interface';
import {CryptoService} from '@services/crypto.service';
import {SolicitudBusquedaPaginado} from '../../../../core/interfaces/solicitud-busqueda-antecedentes.interface';
import {ReporteAntecedentes} from '@models/reporteAntecedentes.interface';
import {ReporteAntecedentesService} from '@services/reporteAntecedentes.service';
import {environment} from '@env/environment.development';

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
export class DetalleAntecedentesComponent extends GeneralComponent implements OnInit {
  userService: UserService = inject(UserService);
  cifradoService: CryptoService = inject(CryptoService);
  reporteAntecedentesService: ReporteAntecedentesService = inject(ReporteAntecedentesService);

  readonly AES_KEY_BASE64: string = environment.key.AES_KEY_BASE64;
  cifrado = ''
  tipoBusqueda!: string;

  REF_USUARIO: string = '';
  REF_APLICATIVO: string = '';
  REF_MODULO: string = '';
  REF_OOAD: string = '';
  REF_NSS: string = '';
  REF_NOMBRE: string = '';
  REF_APATERNO: string = '';
  REF_AMATERNO: string = '';
  REF_ASOCIACION: string = '';

  paginacion = {
    queja: {first: signal(0), rows: 5},
    gestion: {first: signal(0), rows: 5},
    inconformidad: {first: signal(0), rows: 5},
    amparo: {first: signal(0), rows: 5},
    procedimiento: {first: signal(0), rows: 5},
    juicio: {first: signal(0), rows: 5},
  };

  totalQuejas = signal(0);
  totalGestion = signal(0);
  totalInconformidad = signal(0);
  totalAmparo = signal(0);
  totalProcedimiento = signal(0);
  totalJuicio = signal(0);

  private dataFull = signal<any>(null);

  idpagina: number = 0;
  ruta = this._nav.consultaantecedentes;
  titulo = 'Antecedentes';

  usuarioLogueado = '';
  ooadLogueado = '';

  lstQueja = computed(() => {
    const data = this.dataFull()?.queja || [];
    const inicio = this.paginacion.queja.first();
    return data.slice(inicio, inicio + this.paginacion.queja.rows);
  });

  lstGestion = computed(() => {
    const data = this.dataFull()?.gestion || [];
    const inicio = this.paginacion.gestion.first();
    return data.slice(inicio, inicio + this.paginacion.gestion.rows);
  });

  lstInconformidad = computed(() => {
    const data = this.dataFull()?.incoformidad || [];
    const inicio = this.paginacion.inconformidad.first();
    return data.slice(inicio, inicio + this.paginacion.inconformidad.rows);
  });

  lstAmparo = computed(() => {
    const data = this.dataFull()?.amparo || [];
    const inicio = this.paginacion.amparo.first();
    return data.slice(inicio, inicio + this.paginacion.amparo.rows);
  });

  lstProcedimientoRpe = computed(() => {
    const data = this.dataFull()?.procedimientos || [];
    const inicio = this.paginacion.procedimiento.first();
    return data.slice(inicio, inicio + this.paginacion.procedimiento.rows);
  });

  lstJuicio = computed(() => {
    const data = this.dataFull()?.juicio || [];
    const inicio = this.paginacion.juicio.first();
    return data.slice(inicio, inicio + this.paginacion.juicio.rows);
  });

  fechasCorte: DetalleAntecedentes = {
    fecCorteSiade: "",
    fecCorteSsc1: "",
    fecCorteSsc2: "",
    nss: ""
  };

  ref: DynamicDialogRef | undefined;

  first: number = 0;
  rows: number = 10;
  userData: SesionUser | null = null;

  datosUsuario = {
    nombre: '',
    nss: '',
    expediente: '',
    id: ''
  };

  constructor(
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private detalleAntecedentesService: DetalleAntecedentesService,
    private _location: Location
  ) {
    super();

    this.userService.userData$.subscribe(user => this.userData = user);
    this.REF_APLICATIVO = this.userData?.sistemaOrigen as string;
    this.REF_MODULO = this.userData?.modulo as string;
    this.REF_USUARIO = this.userData?.curp as string;
    this.REF_OOAD = this.userData?.ooad as string;
    this.obtenerParametros();

  }

  tabla!: Array<any>;

  ngOnInit(): void {
    this.obtenerFechasCorte();
    this.idpagina = Number(this.route.snapshot.paramMap.get('id'));
    this.obtenerValoresTablas();
  }

  obtenerValoresTablas(): void {
    const busqueda = {
      nombre: this.REF_NOMBRE,
      apellidoPaterno: this.REF_APATERNO,
      apellidoMaterno: this.REF_AMATERNO,
      nss: this.REF_NSS,
      tipoBusqueda: this.tipoBusqueda,
    }
    this.detalleAntecedentesService.consultarGestion(busqueda).subscribe({
      next: (respuesta: any) => {
        this.dataFull.set(respuesta);
        this.totalQuejas.set(respuesta.quejas?.length || 0);
        this.totalGestion.set(respuesta.gestion?.length || 0);
        this.totalInconformidad.set(respuesta.incoformidad?.length || 0);
        this.totalAmparo.set(respuesta.amparo?.length || 0);
        this.totalProcedimiento.set(respuesta.procedimiento?.length || 0);
        this.totalJuicio.set(respuesta.juicio?.length || 0);
      },
      error: err => {
      }
    })
  }


  onPageChange(event: any, seccion: keyof typeof this.paginacion) {
    this.paginacion[seccion].first.set(event.first);
  }

  public btnVerDetalle(
    registro: TablaDetalleGestionInterface,
    idRegistro: number,
    titulo: string
  ) {
    const dtosUsuario = this.datosUsuario;
    this.ref = this.dialogService.open(DetalleComponent, {
      data: {...registro, titulo, dtosUsuario},
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

  obtenerParametros() {
    this.route.paramMap.subscribe((params) => {
      const cacheId = params.get('id');
      this.datosUsuario.id = cacheId!;
    });

    this.route.queryParams.subscribe((qp) => {
      this.tipoBusqueda = qp['tipoBusqueda'] as string;
      this.REF_NSS = qp['nss'] as string;
      this.REF_NOMBRE = qp['n'] as string;
      this.REF_APATERNO = qp['ap'] as string;
      this.REF_AMATERNO = qp['am'] as string;
      this.REF_ASOCIACION = qp['aso'] as string;

      if (qp['valor']) {
        this.cifrado = qp['valor'] as string;
        void this.obtenerExpediente()
      } else {
        this.usuarioLogueado = this.userData?.nombreCompleto ?? '';
        this.ooadLogueado = this.userData?.ooad ?? '';
      }
    });

  }

  async obtenerExpediente() {
    try {
      const REF_SISTEMA = await this.cifradoService.decryptToObject<any>(
        this.cifrado,
        this.AES_KEY_BASE64
      );
      this.ooadLogueado = REF_SISTEMA.ooadLogueado;
      this.usuarioLogueado = REF_SISTEMA.usuarioLogueado;

    } catch (error) {
      console.error("Error al descifrar. Posibles causas: Clave incorrecta o JSON malformado", error);
    }
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

  obtenerFechasCorte() {
    this.detalleAntecedentesService.consultarFechasCorte().subscribe({
      next: (datos) => {
        this.fechasCorte = datos.respuesta;
      }
    })
  }

  imprimir(): void {
    const obj: ReporteAntecedentes = {
      aplicativoOrigen: this.REF_APLICATIVO,
      fecCorteSiade: this.fechasCorte.fecCorteSiade,
      fecCorteSsc1: this.fechasCorte.fecCorteSsc1,
      fecCorteSsc2: this.fechasCorte.fecCorteSsc2,
      moduloOrigen: this.REF_MODULO,
      nombreConsultor: this.usuarioLogueado,
      ooad: this.ooadLogueado,
      tipoBusqueda: +this.tipoBusqueda,
      nombre: this.REF_NOMBRE,
      apellidoPaterno: this.REF_APATERNO,
      apellidoMaterno: this.REF_AMATERNO,
      nss: this.REF_NSS,
      expediente: this.datosUsuario.expediente
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

}
