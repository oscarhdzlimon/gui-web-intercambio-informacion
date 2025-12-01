import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Card} from "primeng/card";
import {Rating} from 'primeng/rating';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {SplitByWidthDirective} from '@directives/split-by-width.directive';
import {Image} from 'primeng/image';
import {Carousel} from 'primeng/carousel';
import {EstadoOfertaService, OfertaEstado} from '@services/estado-oferta.service';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';
import {OportunidadLaboral} from '@models/oportunidad-laboral.interface';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {TooltipModule} from 'primeng/tooltip';
import {GeneralComponent} from '@components/general.component';
import {UserService} from '@services/user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {Subscription} from 'rxjs';
import {environment} from '@env/environment.development';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {SvgAnimationService} from '@services/svg-animation.service';

@Component({
  selector: 'app-detalle-oferta-laboral',
  imports: [
    Card,
    Rating,
    FormsModule,
    Button,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    SplitByWidthDirective,
    Image,
    Carousel,
    CommonModule,
    TooltipModule
  ],
  templateUrl: './detalle-oferta-laboral.component.html',
  styleUrl: './detalle-oferta-laboral.component.scss',
  providers: [CurrencyPipe]
})
export class DetalleOfertaLaboralComponent extends GeneralComponent implements OnInit, OnDestroy {

  private readonly serverEndPointURLDocumento = environment.api.apiDocumentos;
  ref = `${this.serverEndPointURLDocumento}/v1/ooad-documentos/`;
  responsiveOptions!:any;
  value: number = 0;
  userService = inject(UserService);
  userData: SesionUser | null = null;

  mapaRef: string = "";
  imgCarrusel: string[] = [];
  sedes: string = "";

  pdfSrcSede: SafeResourceUrl | undefined;
  urlPDF1!: any;
  urlPDF2!: any;

  loaderService: SvgAnimationService = inject(SvgAnimationService);

  private estadoSubscription: Subscription = new Subscription();

  ofertaSeleccionada: OportunidadLaboral =
    {
      esFavorita: false,
      idPlaza: 0,
      cveOoad: null,
      cvePuesto: null,
      cveUnidad: null,
      porcAltoCostoVida: null,
      especialidad: null,
      categoria: null,
      regimen: null,
      turno: null,
      tipoPlaza: null,
      marcaOcupacion: null,
      umf: null,
      nuevoHospital: null,
      ubicacion: null,
      zona: null,
      direccion: null,
      sueldoMensualBruto: null,
      sueldoMensualNeto: null,
      horario: null,
      numPlaza: null,
      clasificacion: null,
      ooad: null,
      creditos: null,
      bonoDificilCobertura: null,
      accesoCredito: null,
      creditoAutomotriz: null,
      descuentoQuincenalCreditoAutomotriz: null,
      creditoHipotecario: null,
      descuentoQuincenalCreditoHipotecario: null
    };

  tooltipOptions = {
    showDelay: 150,
    autoHide: false,
    tooltipEvent: 'hover',
    tooltipPosition: 'left'
  }

  constructor(private readonly estadoOfertaService: EstadoOfertaService,
              private readonly config: DynamicDialogConfig,
              private readonly currencyPipe: CurrencyPipe,
              private readonly sanitizer: DomSanitizer
  ) {
    super();
    this.responsiveOptions = [
      {
          breakpoint: '1024px',
          numVisible: 1,
          numScroll: 1
      },
      {
          breakpoint: '768px',
          numVisible: 1,
          numScroll: 1
      },
      {
          breakpoint: '560px',
          numVisible: 1,
          numScroll: 1
      }
  ];
  }

  ngOnDestroy(): void {
    this.estadoSubscription.unsubscribe();
  }

  ngOnInit() {
    this.userService.userData$.subscribe(user => this.userData = user);
    if (this.config?.data) {
      this.ofertaSeleccionada = this.config.data;

      this.mapaRef = this.config.data.ref[0].respuesta.mapaSvg?.refGuid;
      this.imgCarrusel = this.config.data.ref[0].respuesta.imagenesPdf;
      this.urlPDF1 = this.config.data.ref[0].respuesta.docPdf;
      this.urlPDF2 = this.config.data.ref[0].respuesta.sedesPdf;
      if(this.config.data.ref[1])this.pdfSrcSede = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.config.data.ref[1]));

    }
    const nuevoEstado = {
      titulo: this.ofertaSeleccionada.especialidad,
      subTitulo: this.ofertaSeleccionada.categoria,
      badgeValue: this.ofertaSeleccionada.nuevoHospital === 1,
    };
    this.estadoOfertaService.actualizarEstado(nuevoEstado);
    this.value = this.ofertaSeleccionada.esFavorita ? 1 : 0;
  }

  cambioDatosHeader(step: number): void {

    let cambioEstado: { titulo: string, subTitulo: string, badgeValue: boolean } = {
      titulo: "",
      subTitulo: "",
      badgeValue: false,
    }

    const titulos: string[] = [this.ofertaSeleccionada.especialidad!, this.ofertaSeleccionada.ooad!, "Sedes"]
    this.estadoSubscription = this.estadoOfertaService.estadoActual$.subscribe(
      (estado: OfertaEstado) => {
        cambioEstado = {
          titulo: titulos[step],
          subTitulo: estado.subTitulo!,
          badgeValue: step == 0 ? estado.badgeValue || false : false
        }
      }
    );

    this.estadoOfertaService.actualizarEstado(cambioEstado);
  }

  agregarFavorito() {
    this._ConvocatoriaService.agregarFavorito(
      {
        idUsuario: this.userData!.idUsuario,
        idPlaza: this.ofertaSeleccionada.idPlaza,
        esFavorita: true
      }
    ).subscribe({
      next: (respuesta) => {
        this.ofertaSeleccionada.esFavorita = true;
        this.value = 1;
        this.loaderService.show();
        this.obtenerTotalFavoritos();
      }
    });
  }

  quitarFavorito() {
    this._ConvocatoriaService.agregarFavorito(
      {
        idUsuario: this.userData!.idUsuario,
        idPlaza: this.ofertaSeleccionada.idPlaza,
        esFavorita: false
      }
    ).subscribe({
      next: (respuesta) => {
        this._alertServices.alerta("Se quito de favoritos");
        this.value = 0;
        this.ofertaSeleccionada.esFavorita = false;
        this.obtenerTotalFavoritos();
      }
    });
  }


  infoTexto(credito: any) {
    const creditoFormateado = this.currencyPipe.transform(
      credito,
      'USD',
      'symbol',
      '1.2-2',
      'en-US'
    ) ?? '';
    return `El importe máximo del descuento quincenal es de hasta ${creditoFormateado} pesos`
  }

  obtenerTotalFavoritos(): void {
    const solicitud = this.generarSolicitudFiltrosFavoritosTotales();
    this._ConvocatoriaService.consultarTotalesFavoritos({...solicitud}).subscribe({
      next: (respuesta: any) => {
        this.estadoOfertaService.actualizarFavoritos(respuesta.respuesta.totalFavoritas);
      }
    })
  }


  generarSolicitudFiltrosFavoritosTotales() {
    return {
      cveEspecialidad: null,
      cveOoad: null,
      cveBono: null,
      regimen: null,
      cveZona: null,
      idUsuario: this.userData?.idUsuario as number
    }
  }

  public btnDescargar(tipoDocumento: number) {
    let refGuid = null;
    let nombre = '';
    if (tipoDocumento == 1) {
      refGuid = this.urlPDF1.refGuid;

      nombre = '' + this.ofertaSeleccionada.ooad;
    } else {
      refGuid = this.urlPDF2.refGuid;
      nombre = 'sedes.pdf';
    }

    if (refGuid != null) {

      return this.documentoService.obtenerDocsPorOoad(refGuid).subscribe({
        next: (response: any) => {
          const blob = new Blob([response], {type: 'application/pdf'});

          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = nombre + '.pdf';
          a.click();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err: any) => {
          console.error(this._Mensajes.MSJ_ERROR_CARGANDO_DOCUMENTO, err);
          this._alertServices.error(this._Mensajes.MSJ_ERROR_CARGANDO_DOCUMENTO);
        }
      });
    }
    return this._alertServices.alerta("No se cuenta con datos para obtener la información");
  }


  public btnDescargarSede(tipoDocumento: number) {
    let refGuid = null;
    let nombre = '';
    if (tipoDocumento == 1) {
      refGuid = this.urlPDF1.refGuid;

      nombre = '' + this.ofertaSeleccionada.ooad;
    } else {
      refGuid = this.urlPDF2.refGuid;
      nombre = 'sedes.pdf';
    }

    if (refGuid != null) {

      return this.documentoService.obtenerDocSede(refGuid).subscribe({
        next: (response: any) => {
          const blob = new Blob([response], {type: 'application/pdf'});

          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = nombre + '.pdf';
          a.click();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err: any) => {
          console.error(this._Mensajes.MSJ_ERROR_CARGANDO_DOCUMENTO, err);
          this._alertServices.error(this._Mensajes.MSJ_ERROR_CARGANDO_DOCUMENTO);
        }
      });
    }
    return this._alertServices.alerta("No se cuenta con datos para obtener la información");
  }
}
