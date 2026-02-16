import {CommonModule} from '@angular/common';
import {Component, effect, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {GeneralComponent} from '@components/general.component';
import {TipoDropdown} from '@models/tipo-dropdown.interface';
import {TablaPrincipalComponent} from '@pages/privado/shared/tabla-principal/tabla-principal.component';
import {ButtonModule} from 'primeng/button';
import {Card} from 'primeng/card';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {InputText} from 'primeng/inputtext';
import {PaginatorModule} from 'primeng/paginator';
import {PopoverModule} from 'primeng/popover';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {TIPO_CONSULTA_ANTECEDENTES} from '@utils/constants';
import {filter} from 'rxjs/operators';
import {AntecedentesService} from '@services/antecedentes.service';
import {TotalesAntecedentes} from '../../../../core/interfaces/totales-antecedentes.interface';
import {RegistroAntecedentes} from '../../../../core/interfaces/registro-antecedentes.interface';
import {UserService} from '@services/user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {BusquedaStateService} from '@services/busqueda-state.service';
import {DetalleAntecedentesService} from '@services/detalle-antecedentes.service';
import {DetalleAntecedentes} from '@models/detalleAntecedentes.interface';
import {
  NuevaSolicitudBusquedaPaginado
} from '../../../../core/interfaces/solicitud-busqueda-antecedentes.interface';
import {
  NuevoRegistroAntecedentes,
  RespuestaAntecedentes,
  TotalAntecedentes
} from '../../../../core/interfaces/respuesta-antecedentes.interface';
import {injectQuery, QueryClient} from '@tanstack/angular-query-experimental';
import {lastValueFrom} from 'rxjs';
import {SolicitudBitacora} from '../../../../core/interfaces/solicitud-bitacora.inerface';
import {ReporteAntecedentes} from '@models/reporteAntecedentes.interface';
import {Usuario} from '@models/usuario';

enum TipoTabla {
  NSS = '1',
  NOMBRE = '2'
}

@Component({
  selector: 'app-consulta-antecedentes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule,
    TablaPrincipalComponent
  ],
  templateUrl: './consulta-antecedentes.component.html',
  styleUrl: './consulta-antecedentes.component.scss'
})
export class ConsultaAntecedentesComponent extends GeneralComponent implements OnInit {

  private queryClient = inject(QueryClient);
  private fb = inject(FormBuilder);
  private busquedaStateService = inject(BusquedaStateService);
  private antecedentesService = inject(AntecedentesService);
  private userService = inject(UserService);
  private detalleAntecedentesService = inject(DetalleAntecedentesService);

  // --- Signals de Estado ---
  paramBusqueda = signal<NuevaSolicitudBusquedaPaginado | null>(
    this.busquedaStateService.obtenerFiltrosAntecedentes()
  );
  sistemasListos = signal<boolean>(false);
  fechasCorte = signal<DetalleAntecedentes | null>(null);

  // --- Data de la UI ---
  tipoconsulta: TipoDropdown[] = TIPO_CONSULTA_ANTECEDENTES;
  filtroForm!: FormGroup;
  totalAntecedentes!: TotalesAntecedentes;
  userData: SesionUser | null = null;

  // Títulos
  tituloTablaNss = signal<string>('Resultados por NSS');
  tituloTablaNombre = signal<string>('Resultados por Nombre y Apellidos');

  // Control de Tablas
  dataNssCompleta: RegistroAntecedentes[] = [];
  dataNombreCompleta: RegistroAntecedentes[] = [];

  dataNssPaginada = signal<RegistroAntecedentes[]>([]);
  dataNombrePaginada = signal<RegistroAntecedentes[]>([]);

  // Paginación
  registrosPorPagina = 10;
  paginaActualNss = 0;
  totalRegistrosNss = 0;
  paginaActualNombre = 0;
  totalRegistrosNombre = 0;

  usuario: Usuario = new Usuario();

  // --- TanStack Query ---
  antecedentesQuery = injectQuery(() => ({
    queryKey: ['antecedentes-general', this.paramBusqueda()],
    queryFn: () => lastValueFrom(this.antecedentesService.getLstAntecedentesGeneral(this.paramBusqueda()!)),
    enabled: !!this.paramBusqueda() && this.sistemasListos() && !!this.fechasCorte(),
    gcTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  }));

  constructor() {
    super();
    this.userService.userData$.subscribe(user => this.userData = user);
    this.usuario.nombreCompleto = this.userData?.nombreCompleto as string;
    this.usuario.sistema = this.userData?.sistemaOrigen as string;
    this.usuario.modulo = this.userData?.modulo as string;
    this.usuario.ooadmin = this.userData?.ooad as string;
    this.filtroForm = this.inicializarFiltroForm();
    this.obtenerFechasCorte();
    this.configurarSuscripcionesUsuario();
    this.configurarEfectoBusqueda();
  }

  ngOnInit(): void {
    this.suscribirATipoConsulta();
    this.recuperarUltimaBusqueda();
  }

  private configurarSuscripcionesUsuario(): void {
    this.userService.userData$.subscribe(user => {
      if (user) {
        this.userData = user;
        this.sistemasListos.set(true);
      }
    });
  }

  private configurarEfectoBusqueda(): void {
    effect(() => {
      const res = this.antecedentesQuery.data();
      const isFetching = this.antecedentesQuery.isFetching();
      const params = this.paramBusqueda();

      if (!params) {
        this.dataNssPaginada.set([]);
        this.dataNombrePaginada.set([]);
        return;
      }

      if (res && !isFetching) {
        this.procesarResultados(res);
      }
    });
  }

  private procesarResultados(res: RespuestaAntecedentes): void {
    this.actualizarTitulos(res);

    // Mapeo de datos completos
    this.dataNssCompleta = Object.values(res.resultadosPorNss).flat().map(i => this.mapearRespuesta(i));
    this.dataNombreCompleta = Object.values(res.resultadosPorNombre).flat().map(i => this.mapearRespuesta(i));

    this.totalRegistrosNss = this.dataNssCompleta.length;
    this.totalRegistrosNombre = this.dataNombreCompleta.length;

    this.totalAntecedentes = this.ajustarTotales(res.totalesGenerales);

    const paginasGuardadas = this.busquedaStateService.obtenerPaginasAntecedentes();

    if (paginasGuardadas) {
      this.paginaActualNss = paginasGuardadas.nssPage;
      this.paginaActualNombre = paginasGuardadas.nombrePage;
    } else {
      this.paginaActualNss = 0;
      this.paginaActualNombre = 0;
    }

    this.renderizarPaginas();
    this.guardarBitacora();
  }

  paginar(): void {
    if (this.filtroForm.invalid) {
      this._alertServices.informacion('Debe completar los campos requeridos.');
      return;
    }

    const payload = this.generarPayload();
    this.busquedaStateService.guardarFiltrosAntecedentes(payload);

    // Al setear el signal, TanStack Query dispara la petición
    this.paramBusqueda.set(payload);
  }

  renderizarPaginas(): void {
    // Slice NSS
    const startNss = this.paginaActualNss * this.registrosPorPagina;
    this.dataNssPaginada.set(this.dataNssCompleta.slice(startNss, startNss + this.registrosPorPagina));

    // Slice Nombre
    const startNom = this.paginaActualNombre * this.registrosPorPagina;
    this.dataNombrePaginada.set(this.dataNombreCompleta.slice(startNom, startNom + this.registrosPorPagina));
  }

  cargarPagina(event: any, tipo: TipoTabla): void {
    if (tipo === TipoTabla.NSS) {
      this.paginaActualNss = event.page - 1;
    } else {
      this.paginaActualNombre = event.page - 1;
    }

    this.busquedaStateService.guardarPaginasAntecedentes(
      this.paginaActualNss,
      this.paginaActualNombre
    );

    this.renderizarPaginas();
  }

  // --- Helpers y Mapeos ---

  private inicializarFiltroForm(): FormGroup {
    return this.fb.group({
      tipoconsulta: ['', Validators.required],
      nss: [{value: null, disabled: true}],
      nombre: [{value: null, disabled: true}],
      apaterno: [{value: null, disabled: true}],
      amaterno: [{value: null, disabled: true}]
    });
  }

  private suscribirATipoConsulta(): void {
    this.filtroForm.get('tipoconsulta')?.valueChanges
      .pipe(filter(v => v !== null))
      .subscribe(tipo => this.aplicarValidaciones(tipo));
  }

  private aplicarValidaciones(tipo: any): void {
    const t = typeof tipo === 'object' ? tipo.value : tipo;
    const {nss, nombre, apaterno, amaterno} = this.filtroForm.controls;

    [nss, nombre, apaterno, amaterno].forEach(c => {
      c.disable();
      c.clearValidators();
      c.setValue(null);
    });

    if (t === 1 || t === 3) {
      nss.enable();
      nss.setValidators(Validators.required);
    }
    if (t === 2 || t === 3) {
      [nombre, apaterno, amaterno].forEach(c => c.enable());
      nombre.setValidators(Validators.required);
      apaterno.setValidators(Validators.required);
    }

    this.filtroForm.updateValueAndValidity();
  }

  private mapearRespuesta(item: NuevoRegistroAntecedentes): RegistroAntecedentes {
    return {
      idBitacoraAsociacion: null,
      indAsociado: false,
      idPersona: (item.numId ?? 0).toString(),
      nss: item.nss,
      nombre: item.nombre,
      apellidoPaterno: item.apellidoPaterno,
      apellidoMaterno: item.apellidoMaterno,
      expediente: '',
      gestion: item.totalesProcedimiento.gestion || 0,
      quejaMedica: item.totalesProcedimiento.queja_de_servicio || 0,
      inconformidades: item.totalesProcedimiento.ic || 0,
      amparoIndirecto: item.totalesProcedimiento.mai || 0,
      procedimientoRpe: item.totalesProcedimiento.rp || 0,
      juicioContencioso: item.totalesProcedimiento.jf || 0,
    };
  }

  private ajustarTotales(totales: TotalAntecedentes): TotalesAntecedentes {
    return {
      totalPorTipo: {
        procedimientoRpe: totales.rp,
        juicioContencioso: totales.jf,
        inconformidad: totales.ic,
        quejaMedica: totales.queja_de_servicio,
        amparoIndirecto: totales.mai,
        gestion: totales.gestion
      },
      totalAsociadosPorTipo: {
        procedimientoRpe: 0, juicioContencioso: 0, inconformidad: 0,
        quejaMedica: 0, amparoIndirecto: 0, gestion: 0
      }
    };
  }

  private generarPayload(): NuevaSolicitudBusquedaPaginado {
    const f = this.filtroForm.getRawValue();
    return {
      personas: [{
        nss: f.nss?.trim() || null,
        nombre: this.limpiarTexto(f.nombre),
        apellidoPaterno: this.limpiarTexto(f.apaterno),
        apellidoMaterno: this.limpiarTexto(f.amaterno)
      }],
      expediente: null,
      ooad_UMAE: this.userData?.ooad || '',
      usuarioLogueado: this.userData?.curp || '',
      sistema: this.userData?.sistemaOrigen || '',
      modulo: this.userData?.modulo || ''
    };
  }

  private actualizarTitulos(res: RespuestaAntecedentes): void {
    const nssKey = Object.keys(res.resultadosPorNss)[0];
    const nomKey = Object.keys(res.resultadosPorNombre)[0];
    this.tituloTablaNss.set(nssKey ? `Resultados por NSS: ${nssKey}` : 'Resultados por NSS');
    this.tituloTablaNombre.set(nomKey ? `Resultados por Nombre: ${nomKey}` : 'Resultados por Nombre');
  }

  recuperarUltimaBusqueda(): void {
    const filtrosGuardados = this.busquedaStateService.obtenerFiltrosAntecedentes();

    if (!filtrosGuardados || !filtrosGuardados.personas || filtrosGuardados.personas.length === 0) return;

    const p = filtrosGuardados.personas[0];
    const form = this.filtroForm;

    let tipo = 0;
    if (p.nss && (p.nombre || p.apellidoPaterno)) tipo = 3;
    else if (p.nss) tipo = 1;
    else if (p.nombre) tipo = 2;

    this.aplicarValidaciones(tipo);

    form.patchValue({
      tipoconsulta: tipo,
      nss: p.nss,
      nombre: p.nombre,
      apaterno: p.apellidoPaterno,
      amaterno: p.apellidoMaterno
    });

    this.filtroForm.markAsDirty();
    this.filtroForm.updateValueAndValidity();

    this.paramBusqueda.set(filtrosGuardados);
  }

  private obtenerFechasCorte() {
    this.detalleAntecedentesService.consultarFechasCorte().subscribe({
      next: (datos) => {
        this.fechasCorte.set(datos.respuesta);
      }
    });
  }

  private guardarBitacora(): void {
    const f = this.filtroForm.getRawValue();
    const fechas = this.fechasCorte();

    if (!fechas) return;
    const solicitud: SolicitudBitacora = {
      fecCorteSiade: fechas.fecCorteSiade,
      fecCorteSsc1: fechas.fecCorteSsc1,
      fecCorteSsc2: fechas.fecCorteSsc2,
      nomPersona: f.nombre ? `${f.nombre} ${f.apaterno} ${f.amaterno}` : null,
      refAplicativo: this.userData?.sistemaOrigen || '',
      refExpediente: null,
      refModulo: this.userData?.modulo || '',
      refNss: f.nss,
      refOoad: this.userData?.ooad || '',
      refUsuarioAutentica: this.userData?.curp || '',
      nomApellidoMaterno: null,
      nomApellidoPaterno: null
    };
    this.antecedentesService.guardarBitacora(solicitud).subscribe();
  }

  limpiar(): void {
    this.paramBusqueda.set(null);

    this.queryClient.removeQueries({ queryKey: ['antecedentes-general'] });

    this.filtroForm.reset();
    this.aplicarValidaciones(null);
    this.filtroForm.markAsPristine();

    this.dataNssCompleta = [];
    this.dataNombreCompleta = [];
    this.dataNssPaginada.set([]);
    this.dataNombrePaginada.set([]);

    this.totalRegistrosNss = 0;
    this.totalRegistrosNombre = 0;
    this.paginaActualNss = 0;
    this.paginaActualNombre = 0;

    this.busquedaStateService.limpiarEstadoCompleto();
  }

  generarObjReporteAntecedentes(): ReporteAntecedentes {

    return {
      tipoBusqueda: null,
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      nss: "",
      expediente: "",
      fecCorteSiade: this.fechasCorte()?.fecCorteSiade ?? '',
      fecCorteSsc1: this.fechasCorte()?.fecCorteSsc1 ?? '',
      fecCorteSsc2: this.fechasCorte()?.fecCorteSsc2 ?? '',
      nombreConsultor: this.usuario.nombreCompleto,
      ooad: this.usuario.ooadmin,
      aplicativoOrigen: this.usuario.sistema,
      moduloOrigen: this.usuario.modulo,
    }
  }

  private limpiarTexto(valor: string | null | undefined): string | null {
    if (!valor) return null;

    return valor
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  protected readonly TipoTabla = TipoTabla;

}
