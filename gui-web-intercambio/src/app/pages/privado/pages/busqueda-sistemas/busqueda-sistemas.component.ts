import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
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
import {SolicitudAntecedentes} from '../../../../core/interfaces/solicitud-antecedentes.interface';
import {Observable} from 'rxjs';
import {TablaPrincipalComponent} from '@pages/privado/shared/tabla-principal/tabla-principal.component';
import {ActivatedRoute} from '@angular/router';
import {SolicitudAsociacion} from '../../../../core/interfaces/solicitud-asociacion.interface';
import {BusquedaStateService, FiltrosBusqueda} from '@services/busqueda-state.service';
import {HttpErrorResponse} from '@angular/common/http';
import {RegistroAntecedentes} from '../../../../core/interfaces/registro-antecedentes.interface';
import {ManejoSolicitudAntecedentesService} from '@services/manejo-solicitud-antecedentes.service';
import {SolicitudBitacora} from '../../../../core/interfaces/solicitud-bitacora.inerface';
import {DetalleAntecedentes} from '@models/detalleAntecedentes.interface';
import {DetalleAntecedentesService} from '@services/detalle-antecedentes.service';
import {SolicitudBusquedaPaginado} from '../../../../core/interfaces/solicitud-busqueda-antecedentes.interface';
import {ConsultaDescifrada} from '../../../../core/interfaces/consulta-descifrada.interface';
import {NombreTipoDropdown} from '../../../../core/interfaces/nombre-tipo-dropdown.interface';
import {ReporteAntecedentes} from '@models/reporteAntecedentes.interface';
import {CryptoService} from '@services/crypto.service';
import {ParamsAsociacion} from '../../../../core/interfaces/params-asociacion.interface';

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
  readonly AES_KEY_BASE64: string = "mZzG9Fz9P0n4z7mZlKz8B9nX0mJ8vF7PZKX2vZx5QmE=";

  cifrado: string = '';

  antecedentesService: AntecedentesService = inject(AntecedentesService);
  detalleAntecedentesService: DetalleAntecedentesService = inject(DetalleAntecedentesService);

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
    fecCorteSiade: "",
    fecCorteSsc1: "",
    fecCorteSsc2: "",
    nss: ""
  };

  REF_SISTEMA!: ConsultaDescifrada;

  private idsCargadosNSS = new Set<string | number>();

  constructor(private readonly fb: FormBuilder,
              private readonly route: ActivatedRoute,
              private busquedaStateService: BusquedaStateService) {
    super();
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
    this.obtenerParametros();
    this.filtroForm = this.inicializarFiltroForm();
    this.suscribirACambiosFiltro();
  }

  recuperarUltimaBusqueda(): void {
    const filtrosGuardados = this.busquedaStateService.obtenerFiltros();

    if (filtrosGuardados) {
      // Aplicar los valores guardados a las variables del componente/formulario
      this.filtroForm.get('filtro')?.setValue(filtrosGuardados.filtro);
      this.filtroForm.get('valor')?.setValue(filtrosGuardados.valor);
      this.consulta_todos = filtrosGuardados.consulta_todos;

      this.iniciarBusqueda();
    }
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
      // IMPORTANTE: Añadir 'await' aquí
      this.REF_SISTEMA = await this.cifradoService.decryptToObject<any>(
        this.cifrado,
        this.AES_KEY_BASE64
      );
      this.obtenerDatosCifrados();
      this.recuperarUltimaBusqueda();
    } catch (error) {
      console.error("Error al descifrar. Posibles causas: Clave incorrecta o JSON malformado", error);
    }
  }

  obtenerDatosCifrados() {
    this.nombresSolicitud = this.REF_SISTEMA.personas.map(n => {
      return {
        nom_nombre_afectado: n.nom_nombre_afectado,
        nom_apellido_paterno_afectado: n.nom_apellido_paterno_afectado,
        nom_apellido_materno_afectado: n.nom_apellido_materno_afectado,
        nombreCompleto: `${n.nom_nombre_afectado} ${n.nom_apellido_paterno_afectado} ${n.nom_apellido_materno_afectado}`,
      }
    });
    this.nss = mapearArregloTipoDropdown(this.REF_SISTEMA.personas, 'cve_nss', 'cve_nss');
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

  iniciarBusqueda(): void {
    const tipoConsulta = this.filtroForm.get('filtro')?.value;
    const valor = this.filtroForm.get('valor')?.value;
    this.idsCargadosNSS.clear();

    const filtros: FiltrosBusqueda = {
      filtro: tipoConsulta,
      valor: valor,
      consulta_todos: this.consulta_todos
    };


    if (this.filtroForm.invalid && !this.consulta_todos) {
      this._alertServices.informacion('Debe seleccionar el filtro y proporcionar el valor de búsqueda.');
      return;
    }

    this.busquedaStateService.guardarFiltros(filtros);

    // Limpiar consultas y totales anteriores
    this.consultas = [];
    this.totalAntecedentes = null as any;

    // Construir las estructuras ResultadoConsulta necesarias

    if (tipoConsulta === 1) { // Caso 1: Búsqueda por NSS (solo tabla NSS)
      this.consulta_todos = false;
      this.consultas.push({
        tipo: TipoTabla.NSS,
        tituloBase: 'Resultados por NSS',
        tituloCompleto: `Resultados por NSS: ${valor}`,
        data: signal([]),
        paginaActual: 0,
        registrosPorPagina: 10,
        totalRegistros: 0,
        valorBusqueda: valor,
        esPaginadoManual: false
      });

      this.ejecutarConsulta(0);
      this.obtenerFechasCorte();

    }

    if (tipoConsulta === 2) { // Caso 2: Búsqueda por Nombre (solo tabla Nombre)
      this.consulta_todos = false;
      this.consultas.push({
        tipo: TipoTabla.NOMBRE,
        tituloBase: 'Resultados por Nombre y Apellidos',
        tituloCompleto: `Resultados por Nombre y Apellidos: ${valor.nombreCompleto}`,
        data: signal([]),
        paginaActual: 0,
        registrosPorPagina: 10,
        totalRegistros: 0,
        valorBusqueda: valor,
        esPaginadoManual: false
      });

      this.ejecutarConsulta(0);
      this.obtenerFechasCorte()
    }

    if (![1, 2].includes(tipoConsulta) && this.consulta_todos) { // Caso 4: Expediente (tablas NSS y Nombre)

      // Creamos la tabla de NSS para el Expediente
      const nss = this.nss.map((nss) => ({
        tipo: TipoTabla.NSS,
        tituloBase: 'Resultados NSS por Expediente',
        tituloCompleto: `Resultados NSS por Expediente: ${nss.value}`,
        data: signal([]),
        paginaActual: 0,
        registrosPorPagina: 10,
        totalRegistros: 0,
        valorBusqueda: nss.value as string,
        esPaginadoManual: false
      }));

      // Creamos la tabla de Nombre para el Expediente
      const nombres = this.nombresSolicitud.map((valor) => ({
        tipo: TipoTabla.NOMBRE,
        tituloBase: 'Resultados Nombre por Expediente',
        tituloCompleto: `Resultados Nombre por Expediente: ${valor.nombreCompleto}`,
        data: signal([]),
        paginaActual: 0,
        registrosPorPagina: 10,
        totalRegistros: 0,
        valorBusqueda: valor,
        esPaginadoManual: true,
        datosCompletosFiltrados: [],
      }));


      this.consultas = [...nss, ...nombres];

      this.obtenerDatosExpediente();
    }

    this.ejecutarConsultaTotal();

  }

  ejecutarConsulta(index: number): void {
    const consulta: ResultadoConsulta = this.consultas[index];
    if (!consulta) return;

    const label: string = (typeof consulta.valorBusqueda === 'string') ? consulta.valorBusqueda : consulta.valorBusqueda.nombreCompleto;

    // Actualizar título
    consulta.tituloCompleto = `${consulta.tituloBase}: ${label || 'Expediente'}`;

    // Preparar la solicitud específica (NSS o Nombre)
    let solicitud: SolicitudBusquedaPaginado;
    if (consulta.tipo === TipoTabla.NSS) {
      solicitud = this.generarSolicitudAntecedentesNSS(consulta.valorBusqueda as string);
    } else { // TipoTabla.NOMBRE
      solicitud = this.generarSolicitudAntecedentesNombre(consulta.valorBusqueda);
    }

    const tipoConsulta = consulta.tipo === TipoTabla.NSS ? 1 : 2;

    // Petición de Listado
    const listObservable: Observable<any> = this.antecedentesService.getLstAntecedentes(
      consulta.esPaginadoManual ? 100 : consulta.registrosPorPagina,
      consulta.paginaActual,
      solicitud,
      tipoConsulta
    );

    // Solo se suscribe al listado, ya que el total es independiente (abajo)
    listObservable.subscribe({
      next: (dataResponse) => {
        let content = dataResponse.busquedaAntecedentesAgrupacionDtos.content || [];
        const idNss = dataResponse.idNss || [];

        if (consulta.tipo === TipoTabla.NSS) {
          // Guardar IDs encontrados por NSS para referencia
          idNss.forEach((id: any) => this.idsCargadosNSS.add(id));
        } else if (consulta.tipo === TipoTabla.NOMBRE && this.consulta_todos) {
          // FILTRAR DUPLICADOS: Si el ID ya fue cargado por una tabla NSS, lo quitamos
          content = content.filter((r: any) => !this.idsCargadosNSS.has(r.idPersona));
        }

        const sincronizados = this.sincronizarEstado(content);
        const finalData = sincronizados.map((row: RegistroAntecedentes) => ({
          ...row,
          key: row.idPersona
        }));

        // Si es manual, aquí harías el slice para tu tabla local (0, 10)
        if (consulta.esPaginadoManual) {
          const filtrados = content.filter((r: any) => !this.idsCargadosNSS.has(r.id));
          consulta.datosCompletosFiltrados = filtrados;
          consulta.totalRegistros = filtrados.length;

          consulta.data.set(finalData.slice(0, 10));
          consulta.totalRegistros = finalData.length;
        } else {
          consulta.data.set(finalData);
          consulta.totalRegistros = dataResponse.busquedaAntecedentesAgrupacionDtos.page.totalElements || 0;
        }
      },
      error: (error) => {
        this._alertServices.error(`Error al obtener resultados por ${consulta.tipo}.`);
        console.error(error);
        consulta.data.set([]);
        consulta.totalRegistros = 0;
      }
    });

  }

  obtenerDatosExpediente(): void {
    this.consultas.forEach((_, index) => {
      this.ejecutarConsulta(index);
    });

    if (this.consultas.length === 0) {
      this._alertServices.informacion('El expediente no tiene NSS ni Nombres asociados para generar consultas.');
    } else {
      this.obtenerFechasCorte();
    }
  }

  generarSolicitudAntecedentesNombre(valor: any): SolicitudBusquedaPaginado {
    return {
      expediente: this.REF_SISTEMA.expediente,
      ooad_UMAE: this.REF_SISTEMA.ooad_UMAE,
      usuarioLogueado: this.REF_SISTEMA.usuarioLogueado,
      sistema: this.REF_SISTEMA.sistema,
      modulo: this.REF_SISTEMA.modulo,
      personas: [{
        nom_nombre_afectado: valor.nom_nombre_afectado,
        nom_apellido_paterno_afectado: valor.nom_apellido_paterno_afectado,
        nom_apellido_materno_afectado: valor.nom_apellido_materno_afectado,
      }]
    }
  }

  generarSolicitudAntecedentesNSS(valor: string): SolicitudBusquedaPaginado {
    return {
      expediente: this.REF_SISTEMA.expediente,
      ooad_UMAE: this.REF_SISTEMA.ooad_UMAE,
      usuarioLogueado: this.REF_SISTEMA.usuarioLogueado,
      sistema: this.REF_SISTEMA.sistema,
      modulo: this.REF_SISTEMA.modulo,
      personas: [{cve_nss: valor}]
    }
  }

  generarSolicitudAntecedentesTotales(): SolicitudBusquedaPaginado {
    return {
      expediente: this.REF_SISTEMA.expediente,
      ooad_UMAE: this.REF_SISTEMA.ooad_UMAE,
      usuarioLogueado: this.REF_SISTEMA.usuarioLogueado,
      sistema: this.REF_SISTEMA.sistema,
      modulo: this.REF_SISTEMA.modulo,
      personas: this.REF_SISTEMA.personas
    }
  }

  cargarPagina(event: any, index: number) {
    const consulta = this.consultas[index];
    const nuevaPagina = event.page - 1;

    if (consulta.esPaginadoManual) {
      consulta.paginaActual = nuevaPagina;
      this.actualizarPaginaLocal(index);
      return;
    }
    if (consulta && (consulta.paginaActual !== nuevaPagina)) {
      consulta.paginaActual = nuevaPagina;
      this.ejecutarConsulta(index); // Ejecuta la búsqueda para esta consulta
    }
  }

  private mapearASolicitud(evento: any): SolicitudAsociacion {
    return {
      cveAsunto: this.REF_SISTEMA.cveAsunto,
      idPersona: evento.idPersona,
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
    if (row.indAsociado) {
      this.solicitudAntecedentesService.agregar(
        row.idPersona,
        this.mapearASolicitud(row)
      );
    } else {
      this.solicitudAntecedentesService.eliminar(row.idPersona);
    }
  }

  ejecutarConsultaTotal(): void {
    const solicitudTotal: SolicitudAntecedentes | SolicitudBusquedaPaginado = this.generarSolicitudAntecedentesTotal();
    const tipoConsulta = this.filtroForm.get('filtro')?.value;

    this.antecedentesService.getTotalAntecedentes(solicitudTotal, tipoConsulta).subscribe({
      next: (totalResponse) => {
        this.totalAntecedentes = totalResponse;
      },
      error: (error) => {
        this._alertServices.error('Ocurrió un error al obtener los totales de antecedentes.');
        console.error('Error al obtener totales:', error);
        this.totalAntecedentes = null as any;
      }
    });
  }

  generarSolicitudAntecedentesTotal(): SolicitudAntecedentes | SolicitudBusquedaPaginado {
    const tipoConsulta = this.filtroForm.get('filtro')?.value;
    const valorBusqueda = this.filtroForm.get('valor')?.value;

    if (this.consulta_todos) {
      return this.generarSolicitudAntecedentesTotales();
    }

    if (tipoConsulta === 1) { // Caso 1: Búsqueda por NSS
      return this.generarSolicitudAntecedentesNSS(valorBusqueda);
    } else
      return this.generarSolicitudAntecedentesNombre(valorBusqueda);
  }


  guardarAsociacion(): void {

    const registros = this.solicitudAntecedentesService.obtenerRegistros();

    const params: ParamsAsociacion = {
      cveAsunto: this.REF_SISTEMA.cveAsunto,
      idModulo: this.REF_SISTEMA.modulo,
      sistema: this.REF_SISTEMA.sistema
    }

    if (registros.length === 0) {
      this._alertServices.alerta(
        'No hay registros seleccionados para asociar.'
      );
      return;
    }

    this.antecedentesService.guardarAsociacion(registros, params).subscribe({
      next: data => {
        const mensajeExito =
          data?.mensaje ||
          'La asociación de registros se ha guardado exitosamente.';

        this._alertServices.exito(mensajeExito);
        this.solicitudAntecedentesService.limpiar();

        this.consultas.forEach((_, index) => {
          this.ejecutarConsulta(index);
        });

      },
      error: (error: HttpErrorResponse) => {

        let mensajeError =
          'Ocurrió un error desconocido al intentar guardar la asociación.';

        if (error.error?.mensaje) {
          mensajeError = error.error.mensaje;
        } else if (error.status === 400) {
          mensajeError =
            'Error de validación: Verifique los datos e intente de nuevo.';
        } else if (error.status === 403) {
          mensajeError =
            'No tiene permisos para realizar esta acción.';
        }

        this._alertServices.error(mensajeError);
        console.error('Error al guardar asociación:', error);
      }
    });
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


  obtenerFechasCorte() {

    const solicitudFechaCorte: SolicitudAntecedentes | SolicitudBusquedaPaginado = this.generarSolicitudAntecedentesTotal();
    const tipoConsulta = this.filtroForm.get('filtro')?.value;

    this.detalleAntecedentesService.consultarFechasCorte(solicitudFechaCorte, tipoConsulta).subscribe({
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

  actualizarPaginaLocal(index: number): void {
    const consulta = this.consultas[index];
    const inicio = consulta.paginaActual * consulta.registrosPorPagina;
    const fin = inicio + consulta.registrosPorPagina;

    if (!consulta.datosCompletosFiltrados) return;
    const paginados = consulta.datosCompletosFiltrados.slice(inicio, fin);

    consulta.data.set(this.sincronizarEstado(paginados));
  }

  get puedeGuardar() {
    return this.solicitudAntecedentesService.tieneRegistros()
  }
}
