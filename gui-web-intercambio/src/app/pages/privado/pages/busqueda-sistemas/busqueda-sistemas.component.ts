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
  SolicitudBusquedaPaginado
} from '../../../../core/interfaces/solicitud-busqueda-antecedentes.interface';
import {ConsultaDescifrada} from '../../../../core/interfaces/consulta-descifrada.interface';
import {NombreTipoDropdown} from '../../../../core/interfaces/nombre-tipo-dropdown.interface';
import {ReporteAntecedentes} from '@models/reporteAntecedentes.interface';
import {CryptoService} from '@services/crypto.service';
import {ParamsAsociacion} from '../../../../core/interfaces/params-asociacion.interface';
import {environment} from '@env/environment.development';
import {RespuestaAntecedentes, TotalAntecedentes} from '../../../../core/interfaces/respuesta-antecedentes.interface';

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
      this.REF_SISTEMA = await this.cifradoService.decryptToObject<any>(
        this.cifrado,
        environment.key.AES_KEY_BASE64
      );
      this.obtenerDatosCifrados();
      this.recuperarUltimaBusqueda();
    } catch (error) {
      console.error("Error al descifrar. Posibles causas: Clave incorrecta o JSON malformado", error);
    }
  }

  obtenerDatosCifrados() {
    this.nombresSolicitud = this.REF_SISTEMA.personas.map(n => {
      const apellido_materno = n.nom_apellido_materno_afectado ?? '';
      return {
        nom_nombre_afectado: n.nom_nombre_afectado,
        nom_apellido_paterno_afectado: n.nom_apellido_paterno_afectado,
        nom_apellido_materno_afectado: apellido_materno,
        nombreCompleto: `${n.nom_nombre_afectado} ${n.nom_apellido_paterno_afectado} ${apellido_materno}`,
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
      // Caso Expediente: Enviamos todos los NSS y todos los Nombres
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

  iniciarBusqueda(): void {
    const tipoConsulta = this.filtroForm.get('filtro')?.value;
    const valor = this.filtroForm.get('valor')?.value;

    if (this.filtroForm.invalid && !this.consulta_todos) {
      this._alertServices.informacion('Debe seleccionar el filtro y proporcionar el valor de búsqueda.');
      return;
    }

    this.configurarEstructuraTablas(tipoConsulta, valor);

    const solicitud = this.generarNuevaSolicitud(tipoConsulta, valor);

    this.antecedentesService.getLstAntecedentesGeneral(solicitud).subscribe({
      next: (res: RespuestaAntecedentes) => {
        this.totalAntecedentes = this.ajustarTotales(res.totalesGenerales);

        // Repartir datos a cada tabla y realizar el primer slice local
        this.consultas.forEach(consulta => {

          let rawItems: any[] = [];
          if (consulta.tipo === TipoTabla.NSS) {
            rawItems = res.resultadosPorNss[consulta.valorBusqueda as string] || [];
          } else {
            const key = (consulta.valorBusqueda as NombreTipoDropdown).nombreCompleto.trim();
            rawItems = res.resultadosPorNombre[key] || [];
          }

          const itemsMapeados: RegistroAntecedentes[] = rawItems.map(item => ({
            idBitacoraAsociacion: item.idBitacoraAsociacion || null,
            indAsociado: item.indAsociado || false,
            idPersona: String(item.numId || item.idPersona), // Asegurar que sea string
            nss: item.nss,
            nombre: item.nombre,
            expediente: item.expediente || this.REF_SISTEMA.expediente,
            apellidoPaterno: item.apellidoPaterno,
            apellidoMaterno: item.apellidoMaterno,
            // Mapeo de los totales que vienen del objeto 'totalesProcedimiento' del JSON original
            gestion: item.totalesProcedimiento?.gestion || 0,
            quejaMedica: item.totalesProcedimiento?.queja_de_servicio || 0,
            amparoIndirecto: item.totalesProcedimiento?.mai || 0,
            juicioContencioso: item.totalesProcedimiento?.jf || 0,
            inconformidades: item.totalesProcedimiento?.ic || 0,
            procedimientoRpe: item.totalesProcedimiento?.rp || 0
          }));

          consulta.datosCompletos = itemsMapeados;
          consulta.totalRegistros = itemsMapeados.length;
          this.actualizarPaginaLocal(this.consultas.indexOf(consulta));
        });

        this.obtenerFechasCorte();
      },
      error: () => this._alertServices.error('Error al obtener antecedentes')
    });
  }

  actualizarPaginaLocal(index: number): void {
    const c = this.consultas[index];

    const inicio = c.paginaActual * c.registrosPorPagina;
    const fin = inicio + c.registrosPorPagina;

    const segmentacion = (c.datosCompletos || []).slice(inicio, fin);

    const datosSincronizados = this.sincronizarEstado(segmentacion);

    c.data.set(datosSincronizados);
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

  cargarPagina(event: any, index: number): void {
    const consulta = this.consultas[index];

    if (consulta) {
      consulta.paginaActual = event.page - 1;
      consulta.registrosPorPagina = event.rows;

      this.actualizarPaginaLocal(index);
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
      cveAsunto: this.REF_SISTEMA.cveAsunto ?? 0,
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

        if (this.REF_SISTEMA.sistema === '1') {
          this.guardarEnSSCV1();
        }
        this.solicitudAntecedentesService.limpiar();

        this.consultas.forEach((_, index) => {
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
    return {
      tipo,
      tituloBase: tipo === TipoTabla.NSS ? 'Resultados por NSS' : 'Resultados por Nombre',
      tituloCompleto: `${tipo === TipoTabla.NSS ? 'NSS' : 'Nombre'}: ${label}`,
      data: signal([]),
      paginaActual: 0,
      registrosPorPagina: 10,
      totalRegistros: 0,
      valorBusqueda: valor,
      datosCompletos: []
    };
  }


  private ajustarTotales(totales: TotalAntecedentes): TotalesAntecedentes {
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

  get puedeGuardar() {
    return this.solicitudAntecedentesService.tieneRegistros()
  }
}
