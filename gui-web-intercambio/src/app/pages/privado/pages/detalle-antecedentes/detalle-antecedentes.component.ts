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

  readonly AES_KEY_BASE64: string = "mZzG9Fz9P0n4z7mZlKz8B9nX0mJ8vF7PZKX2vZx5QmE=";
  cifrado = ''
  tipoBusqueda!: string;

  REF_SISTEMA!: ConsultaDescifrada;
  REF_USUARIO: string = '';
  REF_APLICATIVO: string = '';
  REF_MODULO: string = '';
  REF_OOAD: string = '';
  REF_NSS: string = '';
  REF_NOMBRE: string = '';
  REF_APATERNO: string = '';
  REF_AMATERNO: string = '';

  paginacion = {
    queja: { first: signal(0), rows: 5 },
    gestion: { first: signal(0), rows: 5 },
    inconformidad: { first: signal(0), rows: 5 },
    amparo: { first: signal(0), rows: 5 },
    procedimiento: { first: signal(0), rows: 5 },
    juicio: { first: signal(0), rows: 5 },
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

  estatusPendienteDocumentacion = false;

  ref: DynamicDialogRef | undefined;

  paginaActual: number = 0;
  first: number = 0;
  totalElementos: number = 0;
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
    private readonly dataCacheService: DataCacheService,
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
  tabla2!: Array<any>;

  ngOnInit(): void {
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

  objFechasCorte(): SolicitudBusquedaPaginado {
    return {
      expediente: this.REF_SISTEMA?.expediente || '',

      personas: [
        {
          cve_nss: this.REF_NSS,
          nom_nombre_afectado: this.REF_NOMBRE,
          nom_apellido_paterno_afectado: this.REF_APATERNO,
          nom_apellido_materno_afectado: this.REF_AMATERNO
        }
      ],
      usuarioLogueado: this.REF_USUARIO,
      sistema: this.REF_APLICATIVO,
      modulo: this.REF_MODULO,
      ooad_UMAE: this.REF_OOAD
    }
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
      if (qp['valor']) {
        this.cifrado = qp['valor'] as string;
        void this.obtenerExpediente()
      }
    });

  }

  async obtenerExpediente() {
    try {
      // IMPORTANTE: Añadir 'await' aquí
      this.REF_SISTEMA = await this.cifradoService.decryptToObject<any>(
        this.cifrado,
        this.AES_KEY_BASE64
      );

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
}
