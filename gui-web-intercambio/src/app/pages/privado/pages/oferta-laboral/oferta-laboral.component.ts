import {Component, OnInit, OnDestroy, inject, signal, WritableSignal} from '@angular/core';
import {Card} from 'primeng/card';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TipoDropdown} from '@models/tipo-dropdown.interface';
import {Select} from 'primeng/select';
import {KpiCardComponent} from '@components/kpi-card/kpi-card.component';
import {OfertaCardComponent} from '@components/oferta-card/oferta-card.component';
import {Button} from 'primeng/button';
import {CommonModule, CurrencyPipe, NgClass} from '@angular/common';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {DetalleOfertaLaboralComponent} from '@privado/detalle-oferta-laboral/detalle-oferta-laboral.component';
import {FooterMedicoComponent} from '@pages/privado/shared/footer-medico/footer-medico.component';
import {
  HeaderMedicoDetalleOfertaComponent
} from '@pages/privado/shared/header-medico-detalle-oferta/header-medico-detalle-oferta.component';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {PrimeTemplate} from 'primeng/api';
import {GeneralComponent} from '@components/general.component';
import {mapearArregloTipoDropdown} from '@utils/funciones';
import {ActivatedRoute} from '@angular/router';
import {Subscription, concatMap, forkJoin, map, of, switchMap, tap, throwError} from 'rxjs';
import {EstadoOfertaService} from '@services/estado-oferta.service';

import {OportunidadLaboral} from '@models/oportunidad-laboral.interface';
import {PreguntasFrecuentes} from '@models/preguntas-frecuentes.interface';
import {UserService} from '@services/user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {TableLazyLoadEvent} from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { ClickService } from '@services/click.service';

@Component({
  selector: 'app-oferta-laboral',
  imports: [
    Card,
    ReactiveFormsModule,
    Select,
    KpiCardComponent,
    OfertaCardComponent,
    Button,
    NgClass,
    Paginator,
    PrimeTemplate,
    CommonModule,
    DrawerModule
  ],
  templateUrl: './oferta-laboral.component.html',
  styleUrl: './oferta-laboral.component.scss',
  providers: [DialogService, CurrencyPipe]
})
export class OfertaLaboralComponent extends GeneralComponent implements OnInit, OnDestroy {

  clickService = inject(ClickService);
  userService = inject(UserService);
  userData: SesionUser | null = null;

  subscription!: Subscription;

  first: number = 0;
  rows: number = 10;

  numPaginaActual: number = 0;
  totalElementos: number = 0;

  fb: FormBuilder = inject(FormBuilder);
  ref: DynamicDialogRef | undefined;

  activeTab: WritableSignal<number> = signal(0);

  registros: WritableSignal<OportunidadLaboral[]> = signal([])
  cantidadOfertasLaborales: WritableSignal<number> = signal(0);
  cantidadNuevosHospitales: WritableSignal<number> = signal(0);
  cantidadNuevosHospitalesFiltro: WritableSignal<number> = signal(0);
  cantidadSalarioPromedio: WritableSignal<string> = signal("");

  formTablero!: FormGroup;

  ooad_tablero: TipoDropdown[] = [];
  zona_tablero: TipoDropdown[] = [];
  especialidad_tablero: TipoDropdown[] = [];
  regimen_tablero: TipoDropdown[] = [];
  bono_tablero: TipoDropdown[] = [];
  preguntas_frecuentes: WritableSignal<PreguntasFrecuentes[]> = signal([]);

  private favoritosSubscription: Subscription = new Subscription();
  private ofertasSubscription: Subscription = new Subscription();

  visible: boolean = false;


  constructor(
    public dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly estadoOfertaService: EstadoOfertaService,
    private readonly currencyPipe: CurrencyPipe) {
    super();
    this.formTablero = this.asignarFormTablero();
    this.obtenerCatalogos();
    this.suscribirObservables();
    this.obtenerTotalesGenerales();
  }

  asignarFormTablero(): FormGroup {
    return this.fb.group({
      ooad_tablero: [],
      zona_tablero: [],
      especialidad_tablero: [],
      regimen_tablero: [],
      bono_tablero: []
    })
  }

  data = [
    {
      id: 0,
      name: 'Ver oportunidades',
      icono: 'cme-search',
      description: 'Oportunidades de trabajo',
      price: 0,
    },
    {
      id: 1,
      name: 'Mis favoritos',
      icono: 'cme-fav',
      description: 'Ver solicitudes seleccionadas',
      price: 0,
    },
    {
      id: 2,
      name: 'Preguntas frecuentes',
      icono: 'cme-quest',
      description: 'Respuestas a las preguntas del proceso',
    },
    {
      id: 3,
      name: 'Ubicación de las Unidades Médicas',
      icono: 'cme-marker-pin',
      description: 'Consulte ubicación de unidades médicas',
      ruta: 'https://sites.google.com/view/draft-2025/inicio'
    }
  ];

  actualizarTab(id: number) {
    if (id === 3) {
      const url = this.data[3].ruta;
      window.open(url, '_blank');
      return;
    }
    if (id === 1) {
      this.formTablero.reset({});
      this.consultarFavoritos();
    }
    if (id === 0) {
      this.formTablero.reset({});
      this.consultarPlazas();
    }
    this.activeTab.update(() => id);
  }

  show(oportunidad: OportunidadLaboral) {
    this._CatalogoGenService.getDocumentos(oportunidad.cveOoad!)
    .pipe(
      switchMap(referencias =>  {

        let pdfSede;
        let pdfUbicacion;
        referencias.respuesta.sedesPdf ? pdfSede = this.documentoService.obtenerDocSede(referencias.respuesta.sedesPdf.refGuid) : pdfSede = of(null);
        referencias.respuesta.docPdf ? pdfUbicacion = this.documentoService.obtenerDocsPorOoad(referencias.respuesta.docPdf.refGuid) : pdfUbicacion = of(null);
        return forkJoin([of(referencias),pdfSede,pdfUbicacion])
        }
      ),
    )
    .subscribe({
      next:(ref) => {
        this.ref = this.dialogService.open(DetalleOfertaLaboralComponent, {
          data: {...oportunidad,ref},
          modal: true,
          width: '60vw',
          height: '100vh',
          focusOnShow: false,
          breakpoints: {
            '960px': '75vw',
            '640px': '90vw'
          },
          templates: {
            footer: FooterMedicoComponent,
            header: HeaderMedicoDetalleOfertaComponent
          },
          styleClass: 'oferta-detail'
        });
      }
    });
  }


  seleccionarPaginacion(event?: TableLazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    if (this.activeTab() === 0) {
      this.consultarPlazas("btn");
    } else {
      this.consultarFavoritos();
    }
  }

  cambiarPagina(event: PaginatorState): void {
    if (event.page) {
      this.numPaginaActual = event.page;
    }
    if (this.activeTab() === 0) {
      this.consultarPlazas();
    } else {
      this.consultarFavoritos();
    }
  }

  obtenerCatalogos(): void {
    this.activatedRoute.data.subscribe(({respuesta_oferta}) => {
      const [ooad, especialidad, regimen, bono, preguntas] = respuesta_oferta;

      this.ooad_tablero = mapearArregloTipoDropdown(ooad.respuesta, 'desOoad', 'cveOoad');
      this.especialidad_tablero = mapearArregloTipoDropdown(especialidad, 'desEspecialidad', 'cveEspecialidad');
      this.regimen_tablero = mapearArregloTipoDropdown(regimen.respuesta, 'regimen');
      this.bono_tablero = mapearArregloTipoDropdown(bono.respuesta, 'bono', 'cveBono');
      this.preguntas_frecuentes.update(pf => preguntas.respuesta);
    });
  }

  suscribirObservables(): void {
    this.formTablero.get('ooad_tablero')?.valueChanges.subscribe(value => this.obtenerZonasPorOoad(value))
  }

  obtenerZonasPorOoad(ooad: any): void {
    if (!ooad) return;
    this._CatalogoGenService.getLstZonas(ooad.value).subscribe({
      next: (valor) => {
        if (valor.exito && Array.isArray(valor.respuesta) && valor.respuesta.length > 0) {
          this.zona_tablero = mapearArregloTipoDropdown(valor.respuesta, 'desZona', 'cveZona');
          return;
        }
        this._alertServices.alerta(valor.mensaje);
      }
    });
  }

  consultarPlazas(referencia: string = "paginado") {
    if (referencia == "btn") {
      this.numPaginaActual = 0;
      this.first = 0;
    }
    const ooad = this.formTablero.get('ooad_tablero')?.value;
    const zona = this.formTablero.get('zona_tablero')?.value;
    const especialidad = this.formTablero.get('especialidad_tablero')?.value;
    const regimen = this.formTablero.get('regimen_tablero')?.value;
    const bono = this.formTablero.get('bono_tablero')?.value;

    const bonoParse = bono?.label.replace(/[$,]/g, "") ?? null;

    const filtros = {
      "cveEspecialidad": especialidad?.value,
      "cveOoad": ooad?.value ?? null,
      "cveBono": bono?.value ?? null,
      "regimen": regimen?.label ?? null,
      "cveZona": zona?.value ?? null,
      "idUsuario": this.userData?.idUsuario
    }

    const parameters = {
      "page": this.numPaginaActual,
      "size": this.rows,
      "sort": 'idPlaza,asc'
    }

    //Encadenamiento de subscribes
    this._ConvocatoriaService.consultarPlazas(filtros, parameters).pipe(
      tap(ofertas => {
        //settear paginado y oferta-card
        this.totalElementos = ofertas.page.totalElements;
        this.registros.set(ofertas.content)
      }),
      concatMap(() => this._ConvocatoriaService.consultarTotales(
        {
          cveEspecialidad: filtros.cveEspecialidad,
          cveOoad: filtros.cveOoad,
          cveBono: filtros.cveBono,
          regimen: filtros.regimen,
          cveZona: filtros.cveZona
        }
      ))
    ).subscribe({
      next: (respuesta: any) => {

        const salarioFormateado = this.currencyPipe.transform(
          respuesta.respuesta.promedioSueldosBrutos,
          'USD',
          'symbol',
          '1.2-2',
          'en-US'
        ) ?? '';

        this.cantidadOfertasLaborales.set(respuesta.respuesta.totalResultados);
        this.cantidadNuevosHospitalesFiltro.set(respuesta.respuesta.totalHospitalesNuevos);
        this.cantidadSalarioPromedio.set(salarioFormateado);
      }
    });

  }

  consultarFavoritos(): void {

    const filtros = this.generarSolicitudFiltros();
    const parametros = this.generarSolicitudParametros();

    this._ConvocatoriaService.consultarFavoritos(filtros, parametros).pipe(
      tap(ofertas => {
        //settear paginado y oferta-card
        this.totalElementos = ofertas.page.totalElements;
        this.registros.set(ofertas.content)
      }),
      concatMap(() => this._ConvocatoriaService.consultarTotalesFavoritos(
        {
          cveEspecialidad: filtros.cveEspecialidad,
          cveOoad: filtros.cveOoad,
          cveBono: filtros.cveBono,
          regimen: filtros.regimen,
          cveZona: filtros.cveZona,
          idUsuario: this.userData?.idUsuario as number
        }
      ))
    ).subscribe({
      next: (respuesta: any) => {

        const salarioFormateado = this.currencyPipe.transform(
          respuesta.respuesta.promedioSueldosBrutos,
          'USD',
          'symbol',
          '1.2-2',
          'en-US'
        ) ?? '';

        console.log(respuesta.respuesta)

        this.cantidadOfertasLaborales.set(respuesta.respuesta.totalFavoritas);
        this.cantidadNuevosHospitalesFiltro.set(respuesta.respuesta.totalHospitalesNuevos);
        this.cantidadSalarioPromedio.set(salarioFormateado);
      }
    });

  }

  generarSolicitudFiltros() {

    const ooad = this.formTablero.get('ooad_tablero')?.value;
    const zona = this.formTablero.get('zona_tablero')?.value;
    const especialidad = this.formTablero.get('especialidad_tablero')?.value;
    const regimen = this.formTablero.get('regimen_tablero')?.value;
    const bono = this.formTablero.get('bono_tablero')?.value;

    return {
      cveEspecialidad: especialidad?.value,
      cveOoad: ooad?.value ?? null,
      cveBono: bono?.value ?? null,
      regimen: regimen?.label ?? null,
      cveZona: zona?.value ?? null,
      idUsuario: this.userData?.idUsuario
    }
  }

  generalSolicitudFiltrosTotales() {
    return {
      cveEspecialidad: null,
      cveOoad: null,
      cveBono: null,
      regimen: null,
      cveZona: null
    }
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

  generarSolicitudParametros() {
    return {
      page: this.numPaginaActual,
      size: this.rows,
      sort: 'idPlaza,asc'
    }
  }

  obtenerTotalesGenerales(): void {
    const solicitud = this.generalSolicitudFiltrosTotales();
    this._ConvocatoriaService.consultarTotales({...solicitud}).subscribe({
      next: (respuesta: any) => {
        this.estadoOfertaService.actualizarOfertas(respuesta.respuesta.totalResultados);
      }
    })
  }

  obtenerTotalFavoritos(): void {
    const solicitud = this.generarSolicitudFiltrosFavoritosTotales();
    this._ConvocatoriaService.consultarTotalesFavoritos({...solicitud}).subscribe({
      next: (respuesta: any) => {
        this.estadoOfertaService.actualizarFavoritos(respuesta.respuesta.totalFavoritas);
      }
    })
  }

  ngOnInit() {
    this.userService.userData$.subscribe(user => this.userData = user);
    this.subscription = this.clickService.clic$.subscribe(() => {
      this.visible = true;
    });

    this.obtenerTotalFavoritos();
    this.favoritosSubscription = this.estadoOfertaService.favoritosActuales$.subscribe(
      (numeroFavoritos: number) => {
        const favoritos = this.data[1];
        favoritos.price = numeroFavoritos;
        if (this.activeTab() === 0) {
          this.consultarPlazas();
        } else {
          this.consultarFavoritos();
        }
      }
    );

    this.ofertasSubscription = this.estadoOfertaService.ofertasActuales$.subscribe((numOfertas => {
      const ofertas = this.data[0];
      ofertas.price = numOfertas;
    }));

  }

  ngOnDestroy() {
    this.favoritosSubscription.unsubscribe();
    this.ofertasSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }


}
