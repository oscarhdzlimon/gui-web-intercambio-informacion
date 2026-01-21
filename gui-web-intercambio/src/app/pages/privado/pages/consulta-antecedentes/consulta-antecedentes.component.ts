import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
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
import {SolicitudAntecedentes} from '../../../../core/interfaces/solicitud-antecedentes.interface';
import {AntecedentesService} from '@services/antecedentes.service';
import {forkJoin, Observable, of} from 'rxjs';
import {TotalesAntecedentes} from '../../../../core/interfaces/totales-antecedentes.interface';
import {RegistroAntecedentes} from '../../../../core/interfaces/registro-antecedentes.interface';
import {SolicitudAsociacion} from '../../../../core/interfaces/solicitud-asociacion.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {UserService} from '@services/user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {BusquedaStateService, FiltrosAntecedentes} from '@services/busqueda-state.service';
import {ManejoSolicitudAntecedentesService} from '@services/manejo-solicitud-antecedentes.service';
import {SolicitudBitacora} from '../../../../core/interfaces/solicitud-bitacora.inerface';
import {DetalleAntecedentesService} from '@services/detalle-antecedentes.service';
import {DetalleAntecedentes} from '@models/detalleAntecedentes.interface';
import {ReporteAntecedentes} from '@models/reporteAntecedentes.interface';
import {SolicitudBusquedaPaginado} from '../../../../core/interfaces/solicitud-busqueda-antecedentes.interface';
import {
  RegistroInternoAntecedentes,
  RespuestaInternaAntecedentes, RespuestaTotales
} from '../../../../core/interfaces/respuesta-interna-antecedentes.interface';

enum TipoTabla {
  NSS = '1',
  NOMBRE = '2'
}

@Component({
  selector: 'app-consulta-antecedentes',
  imports: [CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule, TablaPrincipalComponent],
  templateUrl: './consulta-antecedentes.component.html',
  styleUrl: './consulta-antecedentes.component.scss'
})
export class ConsultaAntecedentesComponent extends GeneralComponent implements OnInit {
  antecedentesService: AntecedentesService = inject(AntecedentesService);
  solicitudAntecedentesService: ManejoSolicitudAntecedentesService = inject(ManejoSolicitudAntecedentesService);
  detalleAntecedentesService: DetalleAntecedentesService = inject(DetalleAntecedentesService);

  tipoconsulta: TipoDropdown[] = TIPO_CONSULTA_ANTECEDENTES;

  userService = inject(UserService);

  private dataNombreCompleta: RegistroAntecedentes[] = [];
  private dataNssCompleta: RegistroAntecedentes[] = [];

  filtroForm!: FormGroup;

  // Inicialización de los títulos base
  tituloTablaBase: string = 'Resultados por NSS';
  tituloTablanombreBase: string = 'Resultados por Nombre y Apellidos';
  tituloTabla: string = 'Resultados de la búsqueda'; // Título que se muestra
  tituloTablanombre: string = 'Resultados de la búsqueda'; // Título que se muestra

  registrosPorPaginaNss: number = 10;
  paginaActualNss: number = 0;
  totalregistros: number = 0;
  data: WritableSignal<RegistroAntecedentes[]> = signal([]);

  registrosPorPaginaNombre: number = 10;
  paginaActualNombre: number = 0;
  totalregistrosnombre: number = 0;
  data_nombre: WritableSignal<RegistroAntecedentes[]> = signal([]);

  totalAntecedentes!: TotalesAntecedentes;

  REF_USUARIO: string = '';
  REF_APLICATIVO: string = '';
  REF_MODULO: string = '';
  REF_OOAD: string = '';

  userData: SesionUser | null = null;

  fechasCorte: DetalleAntecedentes = {
    fecCorteSiade: "",
    fecCorteSsc1: "",
    fecCorteSsc2: "",
    nss: ""
  };

  datosUsuario = {
    nombre: '',
    nss: '',
    expediente: '',
  };

  objReporteAntecedentes!: ReporteAntecedentes;

  constructor(private fb: FormBuilder,
              private busquedaStateService: BusquedaStateService) {
    super();
    this.solicitudAntecedentesService.cambios$.subscribe(() => {
      this.data.set(
        this.sincronizarEstado(this.data())
      );
      this.data_nombre.set(
        this.sincronizarEstado(this.data_nombre())
      );
    });
    this.userService.userData$.subscribe(user => this.userData = user);
    this.REF_APLICATIVO = this.userData?.sistemaOrigen as string;
    this.REF_MODULO = this.userData?.modulo as string;
    this.REF_USUARIO = this.userData?.curp as string;
    this.REF_OOAD = this.userData?.ooad as string;
    this.datosUsuario.nombre = this.userData?.nombreCompleto || '';
  }

  ngOnInit(): void {
    this.filtroForm = this.inicializarFiltroForm();
    this.suscribirATipoConsulta();
    this.recuperarUltimaBusqueda();
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
          this.obtenerIdentificador(r)
        )
      }
    });
  }


  recuperarUltimaBusqueda(): void {
    const filtrosGuardados = this.busquedaStateService.obtenerFiltrosAntecedentes();

    if (filtrosGuardados) {
      this.filtroForm.get('tipoconsulta')?.setValue(filtrosGuardados.tipoconsulta);
      this.filtroForm.get('nss')?.setValue(filtrosGuardados.nss);
      this.filtroForm.get('nombre')?.setValue(filtrosGuardados.nombre);
      this.filtroForm.get('apaterno')?.setValue(filtrosGuardados.apaterno);
      this.filtroForm.get('amaterno')?.setValue(filtrosGuardados.amaterno);
      this.paginar(0, 0);
    }
  }

  suscribirATipoConsulta(): void {
    this.filtroForm.get('tipoconsulta')?.valueChanges
      .pipe(filter(value => value !== null && value !== undefined))
      .subscribe(event => {
        const tipo = typeof event === 'object' && event !== null && 'value' in event ? event.value : event;
        this.limpiar(false); // Limpiar datos y validadores al cambiar el tipo, pero sin resetear el formulario
        this.aplicarValidacionCondicional(tipo);
      });
  }

  aplicarValidacionCondicional(tipo: number): void {
    const nss = this.filtroForm.get('nss');
    const nombre = this.filtroForm.get('nombre');
    const apaterno = this.filtroForm.get('apaterno');
    const amaterno = this.filtroForm.get('amaterno');

    this.limpiarValidadores();

    // Lógica de habilitación y validación
    if (tipo === 1) { // NSS
      nss?.enable();
      nss?.setValidators([Validators.required]);

    }
    if (tipo === 2) { // Nombre y apellidos
      nombre?.enable();
      apaterno?.enable();
      amaterno?.enable();
      nombre?.setValidators([Validators.required]);
      apaterno?.setValidators([Validators.required]);

    }
    if (tipo === 3) { // Ambos
      nss?.enable();
      nombre?.enable();
      apaterno?.enable();
      amaterno?.enable();
      nss?.setValidators([Validators.required]);
      nombre?.setValidators([Validators.required]);
      apaterno?.setValidators([Validators.required]);
    }

    // Actualizar validaciones
    [nss, nombre, apaterno, amaterno].forEach(control => {
      control?.updateValueAndValidity();
    });

    this.filtroForm.updateValueAndValidity();
  }

  limpiarValidadores(): void {
    const nss = this.filtroForm.get('nss');
    const nombre = this.filtroForm.get('nombre');
    const apaterno = this.filtroForm.get('apaterno');
    const amaterno = this.filtroForm.get('amaterno');

    [nss, nombre, apaterno, amaterno].forEach(control => {
      control?.clearValidators();
      control?.setValue(null);
      control?.disable();
    });

  }

  cargarPagina(event: any, tipoTabla: TipoTabla) {
    if (tipoTabla === TipoTabla.NSS) {
      this.registrosPorPaginaNss = event.rows;
      this.paginar(event.page - 1, undefined, true);
    } else {
      this.registrosPorPaginaNombre = event.rows;
      this.paginar(undefined, event.page - 1, true);
    }
  }

  private mapearASolicitud(evento: any): SolicitudAsociacion {
    return {
      cveAsunto: '',
      idPersona: evento.idPersona,
      refExpedientePersona: evento.refExpedientePersona,
      idBitacoraAsociacion: evento.idBitacoraAsociacion,
      refUsuarioAutentica: this.REF_USUARIO, // Contexto del componente
      refAplicativoAsociacion: this.REF_APLICATIVO, // Contexto del componente
      refModuloAsociacion: this.REF_MODULO, // Contexto del componente
      refExpediente: evento.expediente,
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

  cambiarEstado(registro: RegistroAntecedentes): void {

    const key = this.obtenerIdentificador(registro);
    if (registro.indAsociado) {
      this.solicitudAntecedentesService.agregar(
        key,
        this.mapearASolicitud(registro)
      );
    } else {
      this.solicitudAntecedentesService.eliminar(key);
    }
  }


  private obtenerIdentificador(item: any): string {

    // Persona
    let personaId: string;

    if (item.nss || item.refNss) {
      personaId = (item.nss ?? item.refNss).trim();
    } else {
      const nombre = (item.nombre ?? item.nomPersona ?? '').trim().toUpperCase();
      const paterno = (item.apellidoPaterno ?? item.nomApellidoPaterno ?? '').trim().toUpperCase();
      const materno = (item.apellidoMaterno ?? item.nomApellidoMaterno ?? '').trim().toUpperCase();

      personaId = `${nombre}-${paterno}-${materno}`;
    }

    // Atributos que hacen único al registro
    const gestion = item.gestion ?? item.numGestion ?? 0;
    const queja = item.quejaMedica ?? item.numQuejaMedica ?? 0;
    const inconformidad = item.inconformidades ?? item.numInconformidad ?? 0;
    const amparo = item.amparoIndirecto ?? item.numAmparoIndirecto ?? 0;
    const rpe = item.procedimientoRpe ?? item.numProcedimientoRpe ?? 0;
    const juicio = item.juicioContencioso ?? item.numJuicioContencioso ?? 0;

    return `${personaId}|${gestion}|${queja}|${inconformidad}|${amparo}|${rpe}|${juicio}`;
  }


  inicializarFiltroForm(): FormGroup {
    return this.fb.group({
      tipoconsulta: ['', Validators.required],
      nss: [{value: null, disabled: true}],
      nombre: [{value: null, disabled: true}],
      apaterno: [{value: null, disabled: true}],
      amaterno: [{value: null, disabled: true}]
    });
  }

  actualizarTitulosTabla(tipoConsultaActual: number): void {
    const nss = this.filtroForm.get('nss')?.value;
    const nombreCompleto = this.generarNombre();

    this.tituloTabla = this.tituloTablaBase;
    this.tituloTablanombre = this.tituloTablanombreBase;

    // Concatena el valor de búsqueda al título
    if ((tipoConsultaActual === 1 || tipoConsultaActual === 3) && nss) {
      this.tituloTabla = `${this.tituloTablaBase}: ${nss}`;
    }

    if ((tipoConsultaActual === 2 || tipoConsultaActual === 3) && nombreCompleto) {
      this.tituloTablanombre = `${this.tituloTablanombreBase}: ${nombreCompleto}`;
    }

  }

  paginar(paginaNss: number | undefined, paginaNombre: number | undefined, consultaLocal: boolean = false): void {
    const tipoConsultaActual = this.filtroForm.get('tipoconsulta')?.value;

    // CASO A: Navegación entre páginas (Manual/Local)
    if (![undefined, 0].includes(paginaNss) || ![undefined, 0].includes(paginaNombre) || consultaLocal) {
      if (paginaNss !== undefined) this.paginaActualNss = paginaNss;
      if (paginaNombre !== undefined) this.paginaActualNombre = paginaNombre;
      this.renderizarPaginasActuales();
      return;
    }

    // CASO B: Búsqueda inicial (Petición al Servidor)
    if (this.filtroForm.invalid) {
      this._alertServices.informacion('Debe completar los campos requeridos.');
      return;
    }

    const filtros = this.obtenerFiltrosNormalizados();
    let obs$: Observable<RespuestaInternaAntecedentes>;

    switch (tipoConsultaActual) {
      case 1: // NSS
        obs$ = this.antecedentesService.getLstAntecedentesByNSS(filtros.nss);
        break;
      case 2: // Nombre
        obs$ = this.antecedentesService.getLstAntecedentesByNombre({
          nombre: filtros.nombre,
          apPaterno: filtros.apPaterno,
          apMaterno: filtros.apMaterno
        });
        break;
      case 3: // Ambos
        obs$ = this.antecedentesService.getLstAntecedentesByAmbos({
          nss: filtros.nss,
          nombre: filtros.nombre,
          apPaterno: filtros.apPaterno,
          apMaterno: filtros.apMaterno
        });
        break;
      default:
        return;
    }

    obs$.subscribe({
      next: (res) => {
        // Guardar data completa mapeada
        this.dataNssCompleta = (res.listaPorNss || []).map(i => this.mapearRespuesta(i));
        this.dataNombreCompleta = (res.listaPorNombre || []).map(i => this.mapearRespuesta(i));

        // Calcular totales internamente
        this.totalAntecedentes = this.ajustarTotales(res.totalesGenerales);

        // Resetear paginación
        this.totalregistros = this.dataNssCompleta.length;
        this.totalregistrosnombre = this.dataNombreCompleta.length;
        this.paginaActualNss = 0;
        this.paginaActualNombre = 0;

        // Mostrar resultados
        this.renderizarPaginasActuales();
        this.obtenerFechasCorte();

        if (this.totalregistros === 0 && this.totalregistrosnombre === 0) {
          this._alertServices.informacion('No se encontraron resultados.');
        }
      },
      error: () => this._alertServices.error('Error al consultar antecedentes.')
    });
  }

  private obtenerFiltrosNormalizados() {
    const f = this.filtroForm.getRawValue();
    return {
      nss: f.nss?.trim(),
      nombre: f.nombre?.trim().toUpperCase(),
      apPaterno: f.apaterno?.trim().toUpperCase(),
      apMaterno: f.amaterno?.trim().toUpperCase() || ''
    };
  }

  generarSolicitudAntecedentes(): SolicitudBusquedaPaginado {
    return {
      expediente: null,
      ooad_UMAE: this.REF_OOAD,
      usuarioLogueado: this.REF_USUARIO,
      sistema: this.REF_APLICATIVO,
      modulo: this.REF_APLICATIVO,
      personas: [{
        nom_nombre_afectado: this.filtroForm.get('nombre')?.value,
        nom_apellido_paterno_afectado: this.filtroForm.get('apaterno')?.value,
        nom_apellido_materno_afectado: this.filtroForm.get('amaterno')?.value,
        cve_nss: this.filtroForm.get('nss')?.value
      }]
    }
  }

  generarSolicitudAntecedentesNSS(): SolicitudBusquedaPaginado {
    return {
      expediente: null,
      ooad_UMAE: this.REF_OOAD,
      usuarioLogueado: this.REF_USUARIO,
      sistema: this.REF_APLICATIVO,
      modulo: this.REF_APLICATIVO,
      personas: [{
        cve_nss: this.filtroForm.get('nss')?.value
      }]
    }
  }

  generarSolicitudAntecedentesNombre(): SolicitudBusquedaPaginado {
    return {
      expediente: null,
      ooad_UMAE: this.REF_OOAD,
      usuarioLogueado: this.REF_USUARIO,
      sistema: this.REF_APLICATIVO,
      modulo: this.REF_APLICATIVO,
      personas: [{
        nom_nombre_afectado: this.filtroForm.get('nombre')?.value,
        nom_apellido_paterno_afectado: this.filtroForm.get('apaterno')?.value,
        nom_apellido_materno_afectado: this.filtroForm.get('amaterno')?.value,
      }]
    }
  }

  generarNombre(): string | null {
    const nombre = this.filtroForm.get('nombre')?.value;
    const apaterno = this.filtroForm.get('apaterno')?.value;
    const amaterno = this.filtroForm.get('amaterno')?.value;

    if (!nombre && !apaterno) return null; // Requiere al menos nombre o apellido paterno

    return [nombre, apaterno, amaterno]
      .filter(segmento => !!segmento)
      .join(' ');
  }

  limpiar(resetForm: boolean = true): void {
    if (resetForm) {
      this.filtroForm.reset({
        tipoconsulta: '',
        nss: {value: null, disabled: true},
        nombre: {value: null, disabled: true},
        apaterno: {value: null, disabled: true},
        amaterno: {value: null, disabled: true}
      });
      this.limpiarValidadores();
    }

    this.tituloTabla = 'Resultados de la búsqueda';
    this.tituloTablanombre = 'Resultados de la búsqueda';

    // Reiniciar paginación y datos de AMBAS tablas
    this.paginaActualNss = 0;
    this.registrosPorPaginaNss = 10;
    this.totalregistros = 0;
    this.data.set([]);

    this.paginaActualNombre = 0;
    this.registrosPorPaginaNombre = 10;
    this.totalregistrosnombre = 0;
    this.data_nombre.set([]);
  }

  protected readonly TipoTabla = TipoTabla;

  guardarAsociacion(): void {
    const registros = this.solicitudAntecedentesService.obtenerRegistros();
    if (registros.length === 0) {
      this._alertServices.alerta('No hay registros seleccionados para asociar.');
      return;
    }

  }

  obtenerFechasCorte() {
    const tipoConsultaActual = this.filtroForm.get('tipoconsulta')?.value;
    const tipoConsulta = [1, 2].includes(tipoConsultaActual) ? tipoConsultaActual : null

    let solicitud = tipoConsultaActual === 1 ? this.generarSolicitudAntecedentesNSS() : this.generarSolicitudAntecedentesNombre();

    if (!tipoConsulta) {
      solicitud = this.generarSolicitudAntecedentes();
    }

    this.detalleAntecedentesService.consultarFechasCorte(solicitud, tipoConsulta).subscribe({
      next: (datos) => {
        this.fechasCorte = datos.respuesta;
        this.guardarBitacora();
      }
    })
  }

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
    return {
      fecCorteSiade: this.fechasCorte.fecCorteSiade,
      fecCorteSsc1: this.fechasCorte.fecCorteSsc1,
      fecCorteSsc2: this.fechasCorte.fecCorteSsc2,
      nomApellidoMaterno: null,
      nomApellidoPaterno: null,
      nomPersona: this.generarNombre(),
      refAplicativo: this.REF_APLICATIVO,
      refExpediente: null,
      refModulo: this.REF_MODULO,
      refNss: this.filtroForm.get('nss')?.value,
      refOoad: this.REF_OOAD,
      refUsuarioAutentica: this.REF_USUARIO
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
      nombreConsultor: this.datosUsuario.nombre,
      ooad: this.REF_OOAD,
      aplicativoOrigen: this.REF_APLICATIVO,
      moduloOrigen: this.REF_MODULO,
    }
  }

  private mapearRespuesta(item: RegistroInternoAntecedentes): RegistroAntecedentes {
    return {
      idBitacoraAsociacion: null,
      indAsociado: false,
      idPersona: item.numId.toString(),
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

  private renderizarPaginasActuales(): void {
    // Slice para tabla NSS
    const startNss = this.paginaActualNss * this.registrosPorPaginaNss;
    let endNss = startNss + this.registrosPorPaginaNss;
    endNss = endNss > this.totalregistros ? this.totalregistros - 1 : endNss - 1;
    this.data.set(this.sincronizarEstado(this.dataNssCompleta.slice(startNss, endNss)));

    // Slice para tabla Nombre
    const startNom = this.paginaActualNombre * this.registrosPorPaginaNombre;
    let endNom = startNom + this.registrosPorPaginaNombre;
    endNom = endNom > this.totalregistrosnombre ? this.totalregistrosnombre - 1 : endNom - 1;
    this.data_nombre.set(this.sincronizarEstado(this.dataNombreCompleta.slice(startNom, endNom)));
  }

  private ajustarTotales(totales: RespuestaTotales): TotalesAntecedentes {
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
        procedimientoRpe: 0,
        juicioContencioso: 0,
        inconformidad: 0,
        quejaMedica: 0,
        amparoIndirecto: 0,
        gestion: 0
      }
    };
  }
}
