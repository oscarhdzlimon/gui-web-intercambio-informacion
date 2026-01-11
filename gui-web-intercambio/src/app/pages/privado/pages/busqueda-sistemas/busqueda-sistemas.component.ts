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

  cifrado = 'H9CacsJvgaCyTIDdfeaUdfcnkFWMvPyiN3h3Qvk3I1UA%2BLgR2A1idqDjNwFlszKBDMMmCRd21WFxvM60QQsB%2BMQcxnK9Bho8U8myQ%2BeaRc5UoW78tX5RfQBcxu1OETjNjfuqqQp69QYjpgaZEPqiozqcZEbl6brK5I4pq4nSM0cnBnuu4mblQknl%2FkjFuZDirajz6cN3A3rnVgVQ4%2FapqOSJlPEmnW1lgyMPJWlKpuByoiEdb5OpgDBP1ct%2Bve80TaLAlwDAofqrtEYWjuE2AfDYllxI%2FwPsIQpEE%2BMQ1meSiSTSRZT21fDchvCrCNKzWnZyjAOCAoH4yKTxZcth1YWynHivtq0NWgD1szZaVowb8C6a7txLfY12sm6Ca7XcbcprnYQUzizGw8tNzkEv6jaZ8k3BOxvkHGq9YZHdpVTiPY12dvPnc1z9n3gXxRNpas04w41UFLglfRa0ze%2BCVwmlq9AVqDTlysUpUBsw9YwAWo9kfA8TY5q%2BXmfGCkjTwHpCK5OH87nIbuoWNrb2WzHkq8EaG%2BIU0ReHIQe1vgqEnhdmwTtC6%2FQuXa0yjuoDmYQCghmWhEFl3Mk7UHYGzumgFzeXu8KN249ft0QLJgj6uC5afGmsO1ZdbJYpmj2%2BaQ9kKgxl2EOcv6KpHldw2%2BRhNICgKVnwU36wJdDOtl%2FQYnhccpgFJaLFdHyQGEeRM%2B9%2BdEKAeMmVaQm%2BlBjXPEHJdtQJkoHi3c2cTF5ygA7AKOJ4Yn60qdgq7%2FDC0rq5%2FJUWKp4dDASg4WnaG4rUCbZEMY2Tml%2FrUGqV%2Bm3TVCVQlc8PrFUrF%2FZcFNsXwEgw'

  antecedentesService: AntecedentesService = inject(AntecedentesService);
  detalleAntecedentesService: DetalleAntecedentesService = inject(DetalleAntecedentesService);

  filtroResultado: TipoDropdown[] = FILTRO_RESULTADOS_EXPEDIENTE;
  nombres: TipoDropdown[] = [];
  nombresSolicitud: NombreTipoDropdown[] = [];
  nss: TipoDropdown[] = [];

  puedeGuardar = false;

  expedienteID: string = '';

  totalAntecedentes!: TotalesAntecedentes;

  consultas: ResultadoConsulta[] = [];

  filtroForm!: FormGroup;

  consulta_todos: boolean = false; // Asumiendo que 4 es el caso 'Todos'

  solicitudAntecedentesService: ManejoSolicitudAntecedentesService = inject(ManejoSolicitudAntecedentesService);
  cifradoService: CryptoService = inject(CryptoService);

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

  REF_SISTEMA!: ConsultaDescifrada;

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
      console.log(this.cifrado)
      this.REF_SISTEMA = await this.cifradoService.decryptToObject<any>(
        this.cifrado,
        this.AES_KEY_BASE64
      );
      this.obtenerDatosCifrados();
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
        tituloCompleto: `Resultados por Nombre y Apellidos: ${valor.nombreCompleto}`,
        data: signal([]),
        paginaActual: 0,
        registrosPorPagina: 10,
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
      consulta.registrosPorPagina,
      consulta.paginaActual,
      solicitud,
      tipoConsulta
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
            key: row.id
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
      refUsuarioAutentica: this.REF_SISTEMA.usuarioLogueado, // Contexto del componente
      refAplicativoAsociacion: this.REF_SISTEMA.sistema, // Contexto del componente
      refModuloAsociacion: this.REF_SISTEMA.modulo, // Contexto del componente
      refExpediente: this.REF_SISTEMA.expediente,
      refExpedientePersona: evento.expediente,
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

    console.log(this.mapearASolicitud(row))
    if (row.indAsociado) {
      this.solicitudAntecedentesService.agregar(
        row.id,
        this.mapearASolicitud(row)
      );
    } else {
      this.solicitudAntecedentesService.eliminar(row.id);
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
      return {expediente: null, nombre: null, nss: null};
    }

    if (tipoConsulta === 1) { // Caso 1: Búsqueda por NSS
      return this.generarSolicitudAntecedentesNSS(valorBusqueda);
    } else
      return this.generarSolicitudAntecedentesNombre(valorBusqueda);
  }


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
          r.id
        )
      }
    });
  }

  trackConsulta = (consulta: ResultadoConsulta) =>
    `${consulta.tipo}-${consulta.valorBusqueda}`;


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
      nomApellidoMaterno: null,
      nomApellidoPaterno: null,
      nomPersona: filtro === 2 ? this.filtroForm.get('valor')?.value : null,
      refAplicativo: this.REF_APLICATIVO,
      refExpediente: this.expedienteID,
      refModulo: this.REF_MODULO,
      refNss: filtro === 1 ? this.filtroForm.get('valor')?.value : null,
      refOoad: this.REF_OOAD,
      refUsuarioAutentica: this.REF_USUARIO

    }
  }

  generarObjReporteAntecedentes(): ReporteAntecedentes {

    return {
      nombre: "",
      nss: "",
      expediente: "",
      fecCorteSiade: this.fechasCorte.fecCorteSiade,
      fecCorteSsc1: this.fechasCorte.fecCorteSsc1,
      fecCorteSsc2: this.fechasCorte.fecCorteSsc2,
      nombreConsultor: this.REF_USUARIO,
      ooad: this.REF_OOAD,
      aplicativoOrigen: this.REF_APLICATIVO,
      moduloOrigen: this.REF_MODULO,
    }
  }
}
