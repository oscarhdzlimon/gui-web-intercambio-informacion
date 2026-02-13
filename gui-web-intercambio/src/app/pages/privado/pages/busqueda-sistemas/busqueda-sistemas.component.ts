import {CommonModule} from '@angular/common';
import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {GeneralComponent} from '@components/general.component';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {ButtonModule} from 'primeng/button';
import {Card} from 'primeng/card';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {PaginatorModule} from 'primeng/paginator';
import {PopoverModule} from 'primeng/popover';
import {SelectModule} from 'primeng/select';
import {TableModule} from 'primeng/table';
import {FILTRO_RESULTADOS_EXPEDIENTE} from '@utils/constants';
import {TipoDropdown} from '@models/tipo-dropdown.interface';
import {AntecedentesService} from '@services/antecedentes.service';
import {mapearArregloTipoDropdown} from '@utils/funciones';
import {ResultadoConsulta} from '../../../../core/interfaces/resultado-consulta.interface';
import {TotalesAntecedentes} from '../../../../core/interfaces/totales-antecedentes.interface';
import {TablaPrincipalComponent} from '@pages/privado/shared/tabla-principal/tabla-principal.component';
import {ActivatedRoute} from '@angular/router';
import {SolicitudAsociacion} from '../../../../core/interfaces/solicitud-asociacion.interface';
import {BusquedaStateService} from '@services/busqueda-state.service';
import {HttpErrorResponse} from '@angular/common/http';
import {RegistroAntecedentes} from '../../../../core/interfaces/registro-antecedentes.interface';
import {ManejoSolicitudAntecedentesService} from '@services/manejo-solicitud-antecedentes.service';
import {SolicitudBitacora} from '../../../../core/interfaces/solicitud-bitacora.inerface';
import {DetalleAntecedentes} from '@models/detalleAntecedentes.interface';
import {DetalleAntecedentesService} from '@services/detalle-antecedentes.service';
import {
  NuevaPersona,
  NuevaSolicitudBusquedaPaginado,
} from '../../../../core/interfaces/solicitud-busqueda-antecedentes.interface';
import {ConsultaDescifrada} from '../../../../core/interfaces/consulta-descifrada.interface';
import {NombreTipoDropdown} from '../../../../core/interfaces/nombre-tipo-dropdown.interface';
import {ReporteAntecedentes} from '@models/reporteAntecedentes.interface';
import {CryptoService} from '@services/crypto.service';
import {ParamsAsociacion} from '../../../../core/interfaces/params-asociacion.interface';
import {environment} from '@env/environment.development';
import {RespuestaAntecedentes, TotalAntecedentes} from '../../../../core/interfaces/respuesta-antecedentes.interface';
import {injectQuery, injectMutation, QueryClient} from '@tanstack/angular-query-experimental';
import {lastValueFrom} from 'rxjs';

enum TipoTabla {
  NSS = '1',
  NOMBRE = '2'
}

@Component({
  selector: 'app-busqueda-sistemas',
  imports: [CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule, NgbAccordionModule, TablaPrincipalComponent],
  templateUrl: './busqueda-sistemas.component.html',
  styleUrl: './busqueda-sistemas.component.scss'
})
export class BusquedaSistemasComponent extends GeneralComponent implements OnInit {
  private queryClient = inject(QueryClient);

  cifrado: string = '';

  antecedentesService: AntecedentesService = inject(AntecedentesService);
  detalleAntecedentesService: DetalleAntecedentesService = inject(DetalleAntecedentesService);
  private busquedaStateService = inject(BusquedaStateService);

  filtroResultado: TipoDropdown[] = FILTRO_RESULTADOS_EXPEDIENTE;
  nombresSolicitud: NombreTipoDropdown[] = [];
  nss: TipoDropdown[] = [];

  totalAntecedentes!: TotalesAntecedentes;

  consultas: ResultadoConsulta[] = [];

  filtroForm!: FormGroup;

  consulta_todos: boolean = false; // Asumiendo que 4 es el caso 'Todos'

  solicitudAntecedentesService: ManejoSolicitudAntecedentesService = inject(ManejoSolicitudAntecedentesService);
  cifradoService: CryptoService = inject(CryptoService);

  fechasCorte: DetalleAntecedentes = {
    fecCorteSiade: '',
    fecCorteSsc1: '',
    fecCorteSsc2: '',
    nss: ""
  };

  REF_SISTEMA!: ConsultaDescifrada;

  paramBusqueda = signal<NuevaSolicitudBusquedaPaginado | null>(
    this.busquedaStateService.obtenerFiltros()
  );

  sistemasListos = signal<boolean>(false);

  antecedentesQuery = injectQuery(() => ({
    queryKey: ['antecedentes', this.paramBusqueda()],
    queryFn: () => lastValueFrom(this.antecedentesService.getLstAntecedentesGeneral(this.paramBusqueda()!)),
    enabled: !!this.paramBusqueda() && this.sistemasListos(),
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 5,
  }));

  constructor(private readonly fb: FormBuilder,
              private readonly route: ActivatedRoute) {
    super();
    this.obtenerFechasCorte();
    this.configurarCambiosEstado();
    this.obtenerParametros();
    this.filtroForm = this.inicializarFiltroForm();
    this.suscribirACambiosFiltro();
    this.configurarEffect();
    this.validarConexiones();
  }

  validarConexiones(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const parentOrigin = urlParams.get('origin') || '*';

    const isPopup = !!window.opener;
    const isIframe = window.parent && window.parent !== window;
    const targetWindow = window.opener || window.parent;

    if (!targetWindow) return;

    try {
      targetWindow.postMessage({type: isPopup ? 'popup:ready' : 'iframe:ready'}, parentOrigin);

    } catch (err) {
      targetWindow.postMessage({
        type: isPopup ? 'popup:error' : 'iframe:error',
        message: 'Servicio no disponible'
      }, parentOrigin);

      //
      if (isPopup) {
        window.close();
        targetWindow.postMessage({type: 'popup:close'}, parentOrigin);
      } else if (isIframe) {
        targetWindow.postMessage({type: 'iframe:close'}, parentOrigin);
      }
    }
  }

  configurarCambiosEstado(): void {
    this.solicitudAntecedentesService.cambios$.subscribe(() => {
      this.consultas.forEach(consulta => {
        const dataActual = consulta.data();
        if (dataActual?.length) {
          consulta.data.set(
            this.sincronizarEstado(dataActual)
          );
        }
      });
    });
  }

  configurarEffect(): void {
    effect(() => {
      const params = this.paramBusqueda();
      const res = this.antecedentesQuery.data(); // TanStack ya resolvió el valor aquí
      const listo = this.sistemasListos();
      const cargando = this.antecedentesQuery.isFetching(); // detectar si hay una petición actual

      if (!listo || !params || cargando) return;

      if (params && this.REF_SISTEMA) {
        const tipo = params.personas[0]?.nss ? 1 : 2;
        const persona = params.personas[0];


        // Se Convierte NuevaPersona a NombreTipoDropdown
        let valorParaTabla: any;
        if (tipo === 1) {
          valorParaTabla = persona.nss;
        } else {
          valorParaTabla = {
            nom_nombre_afectado: persona.nombre,
            nom_apellido_paterno_afectado: persona.apellidoPaterno,
            nom_apellido_materno_afectado: persona.apellidoMaterno,
            nombreCompleto: `${persona.nombre} ${persona.apellidoPaterno} ${persona.apellidoMaterno || ''}`.trim()
          };
        }

        if (this.consultas.length === 0) {
          this.configurarEstructuraTablas(tipo, valorParaTabla);
        }
      }
      if (res) {
        this.totalAntecedentes = this.ajustarTotales(res.totalesGenerales, res.totalesAsociados);
        this.procesarResultadosTablas(res);
        this.guardarBitacora();
      }
    });
  }

  private procesarResultadosTablas(res: RespuestaAntecedentes): void {
    // Iteramos sobre cada objeto de consulta
    this.consultas.forEach((consulta, index) => {

      let rawItems: any[] = [];

      // Extraer los datos según el tipo de tabla
      if (consulta.tipo === TipoTabla.NSS) {
        rawItems = res.resultadosPorNss[consulta.valorBusqueda as string] || [];
      } else {
        const key = (consulta.valorBusqueda as NombreTipoDropdown).nombreCompleto.trim();
        rawItems = res.resultadosPorNombre[key] || [];
      }

      // Mapear los items al modelo RegistroAntecedentes
      const itemsMapeados: RegistroAntecedentes[] = rawItems.map(item => ({
        idBitacoraAsociacion: item.idBitacoraAsociacion || null,
        indAsociado: item.indAsociado || false,
        numId: item.numId,
        idPersona: String(item.numId),
        nss: item.nss,
        nombre: item.nombre,
        expediente: item.expediente || this.REF_SISTEMA.expediente,
        apellidoPaterno: item.apellidoPaterno,
        apellidoMaterno: item.apellidoMaterno,
        // Mapeo de totales por cada registro individual
        gestion: item.totalesProcedimiento?.gestion || 0,
        quejaMedica: item.totalesProcedimiento?.queja_de_servicio || 0,
        amparoIndirecto: item.totalesProcedimiento?.mai || 0,
        juicioContencioso: item.totalesProcedimiento?.jf || 0,
        inconformidades: item.totalesProcedimiento?.ic || 0,
        procedimientoRpe: item.totalesProcedimiento?.rp || 0
      }));

      // Actualizar el estado de la consulta específica
      consulta.datosCompletos = itemsMapeados;
      consulta.totalRegistros = itemsMapeados.length;

      // Refrescar la vista de la página actual para esta tabla
      this.actualizarPaginaLocal(index);
    });
  }

  inicializarFiltroForm(): FormGroup {
    return this.fb.group({
      filtro: ['', Validators.required],
      valor: [{value: null, disabled: true}]
    });
  }

  suscribirACambiosFiltro(): void {
    this.filtroForm.get('filtro')?.valueChanges.subscribe(filtroSeleccionado => {
      const valorControl = this.filtroForm.get('valor');
      if (!valorControl) return;
      valorControl.setValue(null);
      if (filtroSeleccionado) {
        valorControl.enable();
        valorControl.setValidators([Validators.required]);
      } else {
        valorControl.disable();
        valorControl.clearValidators();
      }
      valorControl.updateValueAndValidity();
    });
  }

  obtenerParametros(): void {
    this.route.queryParamMap.subscribe(params => {
      if (!params) return;
      this.cifrado = params.get('valor') as string;
      void this.obtenerExpediente();
    });
  }

  async obtenerExpediente() {
    try {
      this.REF_SISTEMA = await this.cifradoService.decryptToObject<any>(
        this.cifrado,
        environment.key.AES_KEY_BASE64
      );
      this.obtenerDatosCifrados();

      // Una vez que se obtienen las listas de nombres y nss, se parcha el form
      this.parchearFormularioConEstado();
      this.sistemasListos.set(true);
      const filtrosPrevios = this.busquedaStateService.obtenerFiltros();

      if (!filtrosPrevios || filtrosPrevios.personas.length === 0) {
        this.iniciarBusquedaTodos();
      }

    } catch (error) {
      console.error("Error al descifrar", error);
    }
  }

  obtenerDatosCifrados() {
    this.nombresSolicitud = this.REF_SISTEMA.personas.map(n => {
      const apellido_materno = n.nom_apellido_materno_afectado ?? '';
      return {
        nom_nombre_afectado: n.nom_nombre_afectado,
        nom_apellido_paterno_afectado: n.nom_apellido_paterno_afectado,
        nom_apellido_materno_afectado: apellido_materno,
        nombreCompleto: `${n.nom_nombre_afectado} ${n.nom_apellido_paterno_afectado} ${apellido_materno}`.trim(),
      }
    });
    this.nombresSolicitud = [...this.nombresSolicitud].filter(nombre => !!nombre.nom_nombre_afectado);
    this.nss = mapearArregloTipoDropdown(this.REF_SISTEMA.personas, 'cve_nss', 'cve_nss');
    this.nss = [...this.nss].filter(nss => !!nss.value);
  }

  ngOnInit(): void {
  }

  iniciarBusquedaTodos(): void {
    this.filtroForm.get('valor')?.disable();
    this.filtroForm.get('valor')?.clearValidators();
    this.filtroForm.reset({});
    this.consulta_todos = true;
    this.iniciarBusqueda();
  }

  generarNuevaSolicitud(tipoConsulta: number, valor: any): NuevaSolicitudBusquedaPaginado {
    let personas: NuevaPersona[] = [];

    if (this.consulta_todos) {
      // Caso Expediente: Se envian todos los NSS y todos los Nombres
      const nssPersonas = this.nss.map(n => ({
        nss: n.value as string,
        nombre: null,
        apellidoPaterno: null,
        apellidoMaterno: null
      }));
      const nombrePersonas = this.nombresSolicitud.map(n => ({
        nss: null,
        nombre: n.nom_nombre_afectado,
        apellidoPaterno: n.nom_apellido_paterno_afectado,
        apellidoMaterno: n.nom_apellido_materno_afectado
      }));
      personas = [...nssPersonas, ...nombrePersonas];
    } else if (tipoConsulta === 1) {
      // Caso NSS único
      personas = [{nss: valor, nombre: null, apellidoPaterno: null, apellidoMaterno: null}];
    } else {
      // Caso Nombre único
      personas = [{
        nss: null,
        nombre: valor.nom_nombre_afectado,
        apellidoPaterno: valor.nom_apellido_paterno_afectado,
        apellidoMaterno: valor.nom_apellido_materno_afectado
      }];
    }

    return {
      personas,
      expediente: this.REF_SISTEMA.expediente,
      ooad_UMAE: this.REF_SISTEMA.ooad_UMAE,
      usuarioLogueado: this.REF_SISTEMA.usuarioLogueado,
      sistema: this.REF_SISTEMA.sistema,
      modulo: this.REF_SISTEMA.modulo
    };
  }

  iniciarBusqueda(consulta_todos = true): void {
    this.consulta_todos = consulta_todos;
    this.busquedaStateService.limpiarPaginasTablas();

    this.consultas = [];

    this.paramBusqueda.set(null);

    const tipoConsulta = this.filtroForm.get('filtro')?.value;
    const valor = this.filtroForm.get('valor')?.value;

    if (this.filtroForm.invalid && !this.consulta_todos) {
      this._alertServices.informacion('Debe seleccionar filtro...');
      return;
    }

    void this.queryClient.removeQueries({queryKey: ['antecedentes']});

    const solicitud = this.generarNuevaSolicitud(tipoConsulta, valor);

    //  TanStack Query
    this.busquedaStateService.guardarFiltros(solicitud);
    this.configurarEstructuraTablas(tipoConsulta, valor);
    this.paramBusqueda.set(solicitud);
  }

  actualizarPaginaLocal(index: number): void {
    const c = this.consultas[index];

    const inicio = c.paginaActual * c.registrosPorPagina;
    const fin = inicio + c.registrosPorPagina;

    const segmentacion = (c.datosCompletos || []).slice(inicio, fin);

    const datosSincronizados = this.sincronizarEstado(segmentacion);

    c.data.set([...datosSincronizados]);
  }

  cargarPagina(event: any, index: number): void {
    const consulta = this.consultas[index];
    if (consulta) {
      const nuevaPagina = event.page - 1; // PrimeNG usa base 0 o 1 según versión
      consulta.paginaActual = nuevaPagina;

      // Se guarda en el estado global para que sobreviva a la destrucción del componente
      let valorBusqueda;

      if (typeof consulta.valorBusqueda === 'string') {
        valorBusqueda = consulta.valorBusqueda;
      } else {
        valorBusqueda = consulta.valorBusqueda.nombreCompleto.trim();
      }

      const idTabla = `${consulta.tipo}-${valorBusqueda}`;
      this.busquedaStateService.guardarPaginaTabla(idTabla, nuevaPagina);

      this.actualizarPaginaLocal(index);
    }
  }

  private mapearASolicitud(evento: any): SolicitudAsociacion {
    return {
      cveAsunto: this.REF_SISTEMA.cveAsunto,
      idPersona: evento.numId,
      idBitacoraAsociacion: evento.idBitacoraAsociacion,
      refUsuarioAutentica: this.REF_SISTEMA.usuarioLogueado, // Contexto del componente
      refAplicativoAsociacion: this.REF_SISTEMA.sistema, // Contexto del componente
      refModuloAsociacion: this.REF_SISTEMA.modulo, // Contexto del componente
      refExpediente: this.REF_SISTEMA.expediente,
      refExpedientePersona: evento.refExpedientePersona,
      nomPersona: evento.nombre,
      nomApellidoPaterno: evento.apellidoPaterno,
      nomApellidoMaterno: evento.apellidoMaterno,
      refNss: evento.nss,
      // Mapeo de nombres de propiedades
      numGestion: evento.gestion,
      numQuejaMedica: evento.quejaMedica,
      numInconformidad: evento.inconformidades,
      numAmparoIndirecto: evento.amparoIndirecto,
      numProcedimientoRpe: evento.procedimientoRpe,
      numJuicioContencioso: evento.juicioContencioso
    };
  }

  cambiarEstado(row: RegistroAntecedentes): void {
    const numId = row.numId ?? 0;
    if (row.indAsociado) {
      this.solicitudAntecedentesService.agregar(
        numId.toString(),
        this.mapearASolicitud(row)
      );
    } else {
      this.solicitudAntecedentesService.eliminar(numId.toString());
    }
  }

  guardarAsociacion(): void {
    const registros = this.solicitudAntecedentesService.obtenerRegistros();
    const params: ParamsAsociacion = {
      cveAsunto: this.REF_SISTEMA.cveAsunto ?? 0,
      idModulo: this.REF_SISTEMA.modulo,
      sistema: this.REF_SISTEMA.sistema
    };

    if (registros.length === 0) return;

    // Ejecuta la mutación
    this.guardarAsociacionMutation.mutate({registros, params});
  }

  private sincronizarEstado(
    registros: RegistroAntecedentes[]
  ): RegistroAntecedentes[] {

    return registros.map(r => {
      if (r.indAsociado && r.idBitacoraAsociacion) {
        return r;
      }

      return {
        ...r,
        indAsociado: this.solicitudAntecedentesService.existe(
          r.idPersona
        )
      }
    });
  }

  trackConsulta = (consulta: ResultadoConsulta) =>
    `${consulta.tipo}-${consulta.tituloCompleto}`;

  guardarBitacora(): void {
    const solicitud: SolicitudBitacora = this.generarSolicitudBitacora();
    this.antecedentesService.guardarBitacora(solicitud).subscribe({
      next: data => {
      },
      error: (error: HttpErrorResponse) => {
      }
    })
  }

  generarSolicitudBitacora(): SolicitudBitacora {
    const filtro = this.filtroForm.get('filtro')?.value;
    return {
      fecCorteSiade: this.fechasCorte.fecCorteSiade,
      fecCorteSsc1: this.fechasCorte.fecCorteSsc1,
      fecCorteSsc2: this.fechasCorte.fecCorteSsc2,
      nomApellidoMaterno: filtro === 2 ? this.filtroForm.get('valor')?.value.nom_apellido_materno_afectado : null,
      nomApellidoPaterno: filtro === 2 ? this.filtroForm.get('valor')?.value.nom_apellido_paterno_afectado : null,
      nomPersona: filtro === 2 ? this.filtroForm.get('valor')?.value.nom_nombre_afectado : null,
      refAplicativo: this.REF_SISTEMA.sistema,
      refExpediente: this.REF_SISTEMA.expediente,
      refModulo: this.REF_SISTEMA.modulo,
      refNss: filtro === 1 ? this.filtroForm.get('valor')?.value : null,
      refOoad: this.REF_SISTEMA.ooad_UMAE,
      refUsuarioAutentica: this.REF_SISTEMA.usuarioLogueado

    }
  }

  generarObjReporteAntecedentes(): ReporteAntecedentes {

    return {
      tipoBusqueda: null,
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      nss: "",
      expediente: "",
      fecCorteSiade: this.fechasCorte.fecCorteSiade,
      fecCorteSsc1: this.fechasCorte.fecCorteSsc1,
      fecCorteSsc2: this.fechasCorte.fecCorteSsc2,
      nombreConsultor: this.REF_SISTEMA.usuarioLogueado,
      ooad: this.REF_SISTEMA.ooad_UMAE,
      aplicativoOrigen: this.REF_SISTEMA.sistema,
      moduloOrigen: this.REF_SISTEMA.modulo,
    }
  }

  guardarEnSSCV1(): void {
    const consulta = {
      expediente: this.REF_SISTEMA.expediente,
      sistema: this.REF_SISTEMA.sistema,
      modulo: this.REF_SISTEMA.modulo,
      ooadUmae: this.REF_SISTEMA.ooad_UMAE,
    }
    this.antecedentesService.actualizarSSCV1(consulta).subscribe({
      next: (response) => {
        if (response) {
          console.log('Actualizado correctamente SSCV1');
        } else {
          console.log('Error', consulta);
        }
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  configurarEstructuraTablas(tipo: number, valor: any): void {
    this.consultas = [];
    if (this.consulta_todos) {
      // Tablas de NSS
      this.nss.forEach(n => this.consultas.push(this.crearObjetoConsulta(TipoTabla.NSS, n.value as string)));
      // Tablas de Nombre
      this.nombresSolicitud.forEach(nom => this.consultas.push(this.crearObjetoConsulta(TipoTabla.NOMBRE, nom)));
    } else {
      this.consultas.push(this.crearObjetoConsulta(tipo === 1 ? TipoTabla.NSS : TipoTabla.NOMBRE, valor));
    }
  }

  private crearObjetoConsulta(tipo: TipoTabla, valor: any): ResultadoConsulta {
    const label = tipo === TipoTabla.NSS ? valor : valor.nombreCompleto;
    const idTabla = `${tipo}-${label}`; // Identificador único para esta tabla
    return {
      tipo,
      tituloBase: tipo === TipoTabla.NSS ? 'Resultados por NSS' : 'Resultados por Nombre',
      tituloCompleto: `${tipo === TipoTabla.NSS ? 'NSS' : 'Nombre'}: ${label}`,
      data: signal([]),
      // Recuperamos la página del servicio en lugar de forzar 0
      paginaActual: this.busquedaStateService.obtenerPaginaTabla(idTabla),
      registrosPorPagina: 10,
      totalRegistros: 0,
      valorBusqueda: valor,
      datosCompletos: []
    };
  }


  private ajustarTotales(totales: TotalAntecedentes, totalesAsociados: TotalAntecedentes): TotalesAntecedentes {
    // Estructura inicial con acumuladores en 0
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
        procedimientoRpe: totalesAsociados.rp,
        juicioContencioso: totalesAsociados.jf,
        inconformidad: totalesAsociados.ic,
        quejaMedica: totalesAsociados.queja_de_servicio,
        amparoIndirecto: totalesAsociados.mai,
        gestion: totalesAsociados.gestion
      }
    };
  }

  obtenerFechasCorte() {
    this.detalleAntecedentesService.consultarFechasCorte().subscribe({
      next: (datos) => {
        this.fechasCorte = datos.respuesta;
      }
    })
  }

  guardarAsociacionMutation = injectMutation(() => ({
    mutationFn: (data: { registros: any[], params: ParamsAsociacion }) =>
      lastValueFrom(this.antecedentesService.guardarAsociacion(data.registros, data.params)),
    onSuccess: (data) => {
      this._alertServices.exito(data?.mensaje || 'Guardado exitosamente');
      this.solicitudAntecedentesService.limpiar();
      if (this.REF_SISTEMA.sistema === '1') {
        this.guardarEnSSCV1();
      }
      // Invalidar caché para refrescar la tabla automáticamente
      void this.queryClient.invalidateQueries({queryKey: ['antecedentes']});
    },
    onError: (error: HttpErrorResponse) => {
      this._alertServices.error(error.error?.mensaje || 'Error al guardar');
    }
  }));

  private parchearFormularioConEstado(): void {
    const filtrosGuardados = this.busquedaStateService.obtenerFiltros();

    if (!filtrosGuardados || filtrosGuardados.personas.length === 0) return;

    // Caso: Búsqueda de todos (Expediente completo)
    if (filtrosGuardados.personas.length > 1) {
      this.consulta_todos = true;
      return;
    }

    const primeraPersona = filtrosGuardados.personas[0];
    let tipoRescatado = 0;
    let valorRescatado: any = null;

    if (primeraPersona.nss) {
      tipoRescatado = 1; // Caso NSS
      // Se busca el objeto exacto en el arreglo 'nss' para que el dropdown lo reconozca
      valorRescatado = this.nss.find(n => n.value === primeraPersona.nss)?.value || primeraPersona.nss;
    } else if (primeraPersona.nombre) {
      tipoRescatado = 2; // Caso Nombre
      valorRescatado = {
        nom_nombre_afectado: primeraPersona.nombre,
        nom_apellido_paterno_afectado: primeraPersona.apellidoPaterno,
        nom_apellido_materno_afectado: primeraPersona.apellidoMaterno,
        nombreCompleto: `${primeraPersona.nombre} ${primeraPersona.apellidoPaterno} ${primeraPersona.apellidoMaterno || ''}`.trim()
      };

      // Opcional: Intentar encontrar el objeto exacto en la lista cargada para asegurar match de referencia
      const coincidencia = this.nombresSolicitud.find(n => n.nombreCompleto === valorRescatado.nombreCompleto);
      if (coincidencia) valorRescatado = coincidencia;
    }

    // Actualizamos la UI
    this.filtroForm.get('valor')?.enable();
    this.filtroForm.patchValue({
      filtro: tipoRescatado,
      valor: valorRescatado
    }, {emitEvent: false}); // 'emitEvent: false' evita bucles infinitos de validación
  }

  get puedeGuardar() {
    return this.solicitudAntecedentesService.tieneRegistros()
  }
}
