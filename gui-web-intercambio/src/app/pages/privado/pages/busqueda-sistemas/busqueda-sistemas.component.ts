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
import {FILTRO_RESULTADOS_EXPEDIENTE, TIPO_CONSULTA_ANTECEDENTES} from '@utils/constants';
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

enum TipoTabla {
  NSS = 'NSS',
  NOMBRE = 'NOMBRE'
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
  antecedentesService: AntecedentesService = inject(AntecedentesService);

  filtroResultado: TipoDropdown[] = FILTRO_RESULTADOS_EXPEDIENTE;
  nombres: TipoDropdown[] = [];
  nss: TipoDropdown[] = [];

  puedeGuardar = false;

  expedienteID: string = '';

  totalAntecedentes!: TotalesAntecedentes;

  consultas: ResultadoConsulta[] = [];

  filtroForm!: FormGroup;

  consulta_todos: boolean = false; // Asumiendo que 4 es el caso 'Todos'

  solicitudAntecedentesService: ManejoSolicitudAntecedentesService = inject(ManejoSolicitudAntecedentesService);
  detalleAntecedentesService: DetalleAntecedentesService = inject(DetalleAntecedentesService);

  REF_USUARIO: string = '';
  REF_APLICATIVO: string = '';
  REF_MODULO: string = '';
  REF_OOAD: string = '';

  fechasCorte: DetalleAntecedentes = {
    fecCorteSiade: "",
    fecCorteSsc1: "",
    fecCorteSsc2: "",
    nss: ""
  };

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
    this.obtenerExpediente();
    this.filtroForm = this.inicializarFiltroForm();
    this.suscribirACambiosFiltro();
    this.recuperarUltimaBusqueda();
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

  obtenerExpediente() {
    this.route.paramMap.subscribe(params => {
      this.expedienteID = params.get('expediente') ?? '';
    });
    this.route.queryParamMap.subscribe(params => {
      if (!params) return;
      this.REF_USUARIO = params.get('n') as string;
      this.REF_APLICATIVO = params.get('s') as string;
      this.REF_MODULO = params.get('m') as string;
      this.REF_OOAD = params.get('o') as string;
    });
    this.antecedentesService.getExpediente(this.expedienteID).subscribe({
      next: (respuesta) => {
        this.nss = mapearArregloTipoDropdown(respuesta, 'nss', 'nss');
        this.nombres = mapearArregloTipoDropdown(respuesta, 'nombreCompleto', 'nombreCompleto');
      },
      error: (error) => {
      }
    })
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
        registrosPorPagina: 5,
        totalRegistros: 0,
        valorBusqueda: valor
      });

      this.ejecutarConsulta(0);
      this.obtenerFechasCorte();

    }

    if (tipoConsulta === 2) { // Caso 2: Búsqueda por Nombre (solo tabla Nombre)
      this.consulta_todos = false;
      this.consultas.push({
        tipo: TipoTabla.NOMBRE,
        tituloBase: 'Resultados por Nombre y Apellidos',
        tituloCompleto: `Resultados por Nombre y Apellidos: ${valor}`,
        data: signal([]),
        paginaActual: 0,
        registrosPorPagina: 5,
        totalRegistros: 0,
        valorBusqueda: valor
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
        valorBusqueda: nss.value as string
      }));

      // Creamos la tabla de Nombre para el Expediente
      const nombres = this.nombres.map((nombre) => ({
        tipo: TipoTabla.NOMBRE,
        tituloBase: 'Resultados Nombre por Expediente',
        tituloCompleto: `Resultados Nombre por Expediente: ${nombre.value}`,
        data: signal([]),
        paginaActual: 0,
        registrosPorPagina: 10,
        totalRegistros: 0,
        valorBusqueda: nombre.value as string
      }));


      this.consultas = [...nss, ...nombres];

      this.obtenerDatosExpediente();
    }

    this.ejecutarConsultaTotal();

  }

  ejecutarConsulta(index: number): void {
    const consulta: ResultadoConsulta = this.consultas[index];
    if (!consulta) return;

    // Actualizar título
    consulta.tituloCompleto = `${consulta.tituloBase}: ${consulta.valorBusqueda || 'Expediente'}`;

    // Preparar la solicitud específica (NSS o Nombre)
    let solicitud: SolicitudAntecedentes;
    if (consulta.tipo === TipoTabla.NSS) {
      solicitud = this.generarSolicitudAntecedentesNSS(consulta.valorBusqueda as string);
    } else { // TipoTabla.NOMBRE
      solicitud = this.generarSolicitudAntecedentesNombre(consulta.valorBusqueda as string);
    }

    // Petición de Listado
    const listObservable: Observable<any> = this.antecedentesService.getLstAntecedentes(
      consulta.registrosPorPagina,
      consulta.paginaActual,
      solicitud
    );

    // Solo se suscribe al listado, ya que el total es independiente (abajo)
    listObservable.subscribe({
      next: (dataResponse) => {
        const sincronizados = this.sincronizarEstado(
          dataResponse.content || []
        );
        const content = (sincronizados || []).map(
          (row: RegistroAntecedentes) => ({
            ...row,
            key: this.obtenerIdentificador(row)
          })
        );
        consulta.data.set(content);
        consulta.totalRegistros = dataResponse.page.totalElements || 0;
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

  generarSolicitudAntecedentesNombre(valor: string): SolicitudAntecedentes {
    return {
      expediente: this.expedienteID,
      nombre: valor,
      nss: null
    }
  }

  generarSolicitudAntecedentesNSS(valor: string): SolicitudAntecedentes {
    return {
      expediente: this.expedienteID,
      nombre: null,
      nss: valor
    }
  }

  cargarPagina(event: any, index: number) {
    const consulta = this.consultas[index];
    const nuevaPagina = event.page;

    if (consulta && (consulta.paginaActual !== nuevaPagina)) {
      consulta.paginaActual = nuevaPagina;
      this.ejecutarConsulta(index); // Ejecuta la búsqueda para esta consulta
    }
  }

  private mapearASolicitud(evento: any): SolicitudAsociacion {
    return {
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

  cambiarEstado(row: RegistroAntecedentes): void {
    const key = this.obtenerIdentificador(row);

    console.log(row)

    if (row.indAsociado) {
      this.solicitudAntecedentesService.agregar(
        key,
        this.mapearASolicitud(row)
      );
    } else {
      this.solicitudAntecedentesService.eliminar(key);
    }
  }

  private obtenerIdentificador(item: any): string {

    const expediente = item.expediente ?? item.refExpediente;

    // NSS + expediente (si ambos existen)
    if ((item.nss || item.refNss) && expediente) {
      const nss = (item.nss ?? item.refNss).trim();
      return `${nss}-${expediente}`;
    }

    // SIN NSS pero CON expediente
    if (!item.nss && !item.refNss && expediente) {
      const nombre = (item.nombre ?? '').trim().toUpperCase();
      const paterno = (item.apellidoPaterno ?? '').trim().toUpperCase();
      const materno = (item.apellidoMaterno ?? '').trim().toUpperCase();

      return `${nombre}-${paterno}-${materno}-${expediente}`;
    }

    // SIN expediente → NSS o nombre + apellidos
    if (item.nss || item.refNss) {
      return (item.nss ?? item.refNss).trim();
    }

    const nombre = (item.nombre ?? '').trim().toUpperCase();
    const paterno = (item.apellidoPaterno ?? '').trim().toUpperCase();
    const materno = (item.apellidoMaterno ?? '').trim().toUpperCase();

    return `${nombre}-${paterno}-${materno}`;
  }

  ejecutarConsultaTotal(): void {
    const solicitudTotal: SolicitudAntecedentes = this.generarSolicitudAntecedentesTotal();

    this.antecedentesService.getTotalAntecedentes(solicitudTotal).subscribe({
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

  generarSolicitudAntecedentesTotal(): SolicitudAntecedentes {
    const tipoConsulta = this.filtroForm.get('filtro')?.value;
    const valorBusqueda = this.filtroForm.get('valor')?.value;

    if (this.consulta_todos) {
      return {expediente: null, nombre: null, nss: null};
    }

    if (tipoConsulta === 1) { // Caso 1: Búsqueda por NSS
      return {
        expediente: this.expedienteID,
        nombre: null,
        nss: valorBusqueda
      };
    } else
      return {
        expediente: this.expedienteID,
        nombre: valorBusqueda, // Enviar el Nombre como un arreglo de un elemento
        nss: null
      };
  }

  protected readonly tipoconsulta = TIPO_CONSULTA_ANTECEDENTES;

  guardarAsociacion(): void {

    const registros = this.solicitudAntecedentesService.obtenerRegistros();

    if (registros.length === 0) {
      this._alertServices.alerta(
        'No hay registros seleccionados para asociar.'
      );
      return;
    }

    this.antecedentesService.guardarAsociacion(registros).subscribe({
      next: data => {
        const mensajeExito =
          data?.mensaje ||
          'La asociación de registros se ha guardado exitosamente.';

        this._alertServices.exito(mensajeExito);
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

    return registros.map(r => ({
      ...r,
      indAsociado: this.solicitudAntecedentesService.existe(
        this.obtenerIdentificador(r)
      )
    }));
  }

  trackConsulta = (consulta: ResultadoConsulta) =>
    `${consulta.tipo}-${consulta.valorBusqueda}`;


  obtenerFechasCorte() {
    const datosUsuario = this.obtenerDatosUsario();
    this.detalleAntecedentesService.consultarFechasCorte(datosUsuario).subscribe({
      next: (datos) => {
        this.fechasCorte = datos.respuesta;
        this.guardarBitacora();
      }
    })
  }

  obtenerDatosUsario() {
    const filtro = this.filtroForm.get('filtro')?.value;

    return {
      nombre: filtro === 1 ? this.filtroForm.get('valor')?.value : null,
      nss: filtro === 2 ? this.filtroForm.get('valor')?.value : null,
      expediente: null,
    };

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
      nomApellidoMaterno: null,
      nomApellidoPaterno: null,
      nomPersona: filtro === 1 ? this.filtroForm.get('valor')?.value : null,
      refAplicativo: this.REF_APLICATIVO,
      refExpediente: null,
      refModulo: this.REF_MODULO,
      refNss: filtro === 2 ? this.filtroForm.get('valor')?.value : null,
      refOoad: this.REF_OOAD,
      refUsuarioAutentica: this.REF_USUARIO

    }
  }
}
