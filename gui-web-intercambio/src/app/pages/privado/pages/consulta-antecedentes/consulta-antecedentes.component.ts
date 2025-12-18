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

enum TipoTabla {
  NSS = 'NSS',
  NOMBRE = 'NOMBRE'
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

  tipoconsulta: TipoDropdown[] = TIPO_CONSULTA_ANTECEDENTES;

  userService = inject(UserService);

  filtroForm!: FormGroup;

  // 🔑 Inicialización de los títulos base
  tituloTablaBase: string = 'Resultados por NSS';
  tituloTablanombreBase: string = 'Resultados por Nombre y Apellidos';
  tituloTabla: string = 'Resultados de la búsqueda'; // Título que se muestra
  tituloTablanombre: string = 'Resultados de la búsqueda'; // Título que se muestra

  registrosPorPaginaNss: number = 5;
  paginaActualNss: number = 0;
  totalregistros: number = 0;
  data: WritableSignal<RegistroAntecedentes[]> = signal([]);

  registrosPorPaginaNombre: number = 5;
  paginaActualNombre: number = 0;
  totalregistrosnombre: number = 0;
  data_nombre: WritableSignal<RegistroAntecedentes[]> = signal([]);

  totalAntecedentes!: TotalesAntecedentes;

  registrosAsociacion: SolicitudAsociacion[] = [];

  REF_USUARIO: string = '';
  REF_APLICATIVO: string = '';
  REF_MODULO: string = '';

  userData: SesionUser | null = null;

  constructor(private fb: FormBuilder,
              private busquedaStateService: BusquedaStateService) {
    super();
    this.userService.userData$.subscribe(user => this.userData = user);
    this.REF_APLICATIVO = this.userData?.sistemaOrigen as string;
    this.REF_MODULO = this.userData?.modulo as string;
    this.REF_USUARIO = this.userData?.curp as string;
  }

  ngOnInit(): void {
    this.filtroForm = this.inicializarFiltroForm();
    this.suscribirATipoConsulta();
    this.recuperarUltimaBusqueda();
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
    const nuevaPagina = event.page;
    const nuevoTamanio = event.rows;

    if (tipoTabla === TipoTabla.NSS) {
      if (this.paginaActualNss !== nuevaPagina || this.registrosPorPaginaNss !== nuevoTamanio) {
        this.paginaActualNss = nuevaPagina;
        this.registrosPorPaginaNss = nuevoTamanio;
        this.paginar();
      }
    } else if (tipoTabla === TipoTabla.NOMBRE) {
      if (this.paginaActualNombre !== nuevaPagina || this.registrosPorPaginaNombre !== nuevoTamanio) {
        this.paginaActualNombre = nuevaPagina;
        this.registrosPorPaginaNombre = nuevoTamanio;
        this.paginar();
      }
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

  cambiarEstado(event: any): void {
    console.log('Checkbox cambiado:', event);

    const identificador = this.obtenerIdentificador(event);

    if (event.indAsociado) {

      const nuevaSolicitud: SolicitudAsociacion = this.mapearASolicitud(event);

      const existe = this.registrosAsociacion.some(
        r => this.obtenerIdentificador(r) === identificador
      );

      if (!existe) {
        this.registrosAsociacion.push(nuevaSolicitud);
        console.log(`Registro añadido. Total: ${this.registrosAsociacion.length}`);
      }

    } else {

      const totalAntes = this.registrosAsociacion.length;

      console.log(this.registrosAsociacion);

      this.registrosAsociacion = this.registrosAsociacion.filter(r => this.obtenerIdentificador(r) !== identificador);

      console.log(this.registrosAsociacion)

      if (this.registrosAsociacion.length < totalAntes) {
        console.log(`Registro eliminado. Total: ${this.registrosAsociacion.length}`);
      }
    }
  }

  private obtenerIdentificador(item: any): string {

    // Si existe NSS, es el identificador único
    if (item.nss || item.refNss) {
      return (item.nss ?? item.refNss).trim();
    }

    // Sin NSS → nombre + apellidos
    const nombre = (item.nombre ?? '').trim().toUpperCase();
    const paterno = (item.apellidoPaterno ?? '').trim().toUpperCase();
    const materno = (item.apellidoMaterno ?? '').trim().toUpperCase(); // opcional

    return `${nombre}-${paterno}-${materno}`;
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

  paginar(paginaNss?: number, paginaNombre?: number): void {
    const tipoConsultaActual = this.filtroForm.get('tipoconsulta')?.value;

    if (paginaNss !== undefined) {
      this.paginaActualNss = paginaNss;
      if (tipoConsultaActual === 1 || tipoConsultaActual === 3) {
        this.paginaActualNombre = 0;
      }
    }
    if (paginaNombre !== undefined) {
      this.paginaActualNombre = paginaNombre;
      if (tipoConsultaActual === 2 || tipoConsultaActual === 3) {
        this.paginaActualNss = 0;
      }
    }

    const pagNss = paginaNss !== undefined ? paginaNss : this.paginaActualNss;
    const pagNombre = paginaNombre !== undefined ? paginaNombre : this.paginaActualNombre;

    if (this.filtroForm.invalid) {
      this._alertServices.informacion('Debe completar los campos requeridos para realizar la búsqueda.');
      return;
    }

    const filtros: FiltrosAntecedentes = {
      amaterno: this.filtroForm.get('amaterno')?.value,
      apaterno: this.filtroForm.get('apaterno')?.value,
      nombre: this.filtroForm.get('nombre')?.value,
      nss: this.filtroForm.get('nss')?.value,
      tipoconsulta: this.filtroForm.get('tipoconsulta')?.value
    }

    console.log(filtros);

    this.busquedaStateService.guardarFiltrosAntecedentes(filtros);

    this.actualizarTitulosTabla(tipoConsultaActual);

    // Definir los observables de búsqueda necesarios
    let listObservableNss: Observable<any> = of({
      content: [],
      page: {size: 0, number: 0, totalElements: 0, totalPages: 0}
    });
    let listObservableNombre: Observable<any> = of({
      content: [],
      page: {size: 0, number: 0, totalElements: 0, totalPages: 0}
    });
    const solicitud: SolicitudAntecedentes = this.generarSolicitudAntecedentes();
    let totalObservable: Observable<TotalesAntecedentes> = this.antecedentesService.getTotalAntecedentes(solicitud);

    // --- Lógica de bifurcación de búsqueda ---

    if (tipoConsultaActual === 1 || tipoConsultaActual === 3) {
      const solicitudNss: SolicitudAntecedentes = this.generarSolicitudAntecedentesNSS();
      listObservableNss = this.antecedentesService.getLstAntecedentes(this.registrosPorPaginaNss, pagNss, solicitudNss);
    }

    if (tipoConsultaActual === 2 || tipoConsultaActual === 3) {
      const solicitudNombre: SolicitudAntecedentes = this.generarSolicitudAntecedentesNombre();
      listObservableNombre = this.antecedentesService.getLstAntecedentes(this.registrosPorPaginaNombre, pagNombre, solicitudNombre);
    }

    // --- Ejecución de las búsquedas paralelas ---

    forkJoin([
      listObservableNss,
      listObservableNombre,
      totalObservable
    ]).subscribe({
      next: ([dataNss, dataNombre, totalResponse]) => {

        // Limpieza de datos si el criterio no aplica
        if (tipoConsultaActual === 1 || tipoConsultaActual === 3) {
          this.data.set(dataNss.content);
          this.totalregistros = dataNss.page.totalElements;
        } else {
          this.data.set([]);
          this.totalregistros = 0;
        }

        if (tipoConsultaActual === 2 || tipoConsultaActual === 3) {
          this.data_nombre.set(dataNombre.content);
          this.totalregistrosnombre = dataNombre.page.totalElements;
        } else {
          this.data_nombre.set([]);
          this.totalregistrosnombre = 0;
        }

        this.totalAntecedentes = totalResponse;

        if (this.totalregistros === 0 && this.totalregistrosnombre === 0) {
          this._alertServices.informacion('No se encontraron antecedentes con los criterios seleccionados.');
        }
      },
      error: (error) => {
        this._alertServices.error('Ocurrió un error al obtener los antecedentes.');
        console.error('Error al paginar/obtener totales:', error);
        this.data.set([]);
        this.data_nombre.set([]);
        this.totalregistros = 0;
        this.totalregistrosnombre = 0;
      }
    });
  }

  generarSolicitudAntecedentes(): SolicitudAntecedentes {
    return {
      expediente: null,
      nombre: this.generarNombre(),
      nss: this.filtroForm.get('nss')?.value
    }
  }

  generarSolicitudAntecedentesNSS(): SolicitudAntecedentes {
    return {
      expediente: null,
      nombre: null,
      nss: this.filtroForm.get('nss')?.value
    }
  }

  generarSolicitudAntecedentesNombre(): SolicitudAntecedentes {
    return {
      expediente: null,
      nombre: this.generarNombre(),
      nss: null
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
    this.registrosPorPaginaNss = 5;
    this.totalregistros = 0;
    this.data.set([]);

    this.paginaActualNombre = 0;
    this.registrosPorPaginaNombre = 5;
    this.totalregistrosnombre = 0;
    this.data_nombre.set([]);
  }

  protected readonly TipoTabla = TipoTabla;

  guardarAsociacion(): void {
    if (this.registrosAsociacion.length === 0) {
      this._alertServices.alerta('No hay registros seleccionados para asociar.');
      return;
    }

    this.antecedentesService.guardarAsociacion(this.registrosAsociacion).subscribe({
      next: data => {
        const mensajeExito = data?.mensaje || 'La asociación de registros se ha guardado exitosamente.';

        this._alertServices.exito(mensajeExito);
      },
      error: (error: HttpErrorResponse) => {

        let mensajeError = 'Ocurrió un error desconocido al intentar guardar la asociación.';

        if (error.error && error.error.mensaje) {
          mensajeError = error.error.mensaje;
        } else if (error.status === 400) {
          mensajeError = 'Error de validación: Verifique los datos e intente de nuevo.';
        } else if (error.status === 403) {
          mensajeError = 'No tiene permisos para realizar esta acción.';
        }

        this._alertServices.error(mensajeError);
        console.error('Error al guardar asociación:', error);
      }
    });
  }
}
