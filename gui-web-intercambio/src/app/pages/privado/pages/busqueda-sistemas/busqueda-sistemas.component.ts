import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {GeneralComponent} from '@components/general.component';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {TablaAcordeonComponent} from '@pages/privado/shared/tabla-acordeon/tabla-acordeon.component';
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
    PopoverModule, TablaAcordeonComponent, NgbAccordionModule],
  templateUrl: './busqueda-sistemas.component.html',
  styleUrl: './busqueda-sistemas.component.scss'
})
export class BusquedaSistemasComponent extends GeneralComponent implements OnInit {
  antecedentesService: AntecedentesService = inject(AntecedentesService);

  filtroResultado: TipoDropdown[] = FILTRO_RESULTADOS_EXPEDIENTE;
  nombres: TipoDropdown[] = [];
  nss: TipoDropdown[] = [];

  totalAntecedentes!: TotalesAntecedentes;

  consultas: ResultadoConsulta[] = [];

  filtroForm!: FormGroup;

  consulta_todos: boolean = false; // Asumiendo que 4 es el caso 'Todos'

  constructor(private readonly fb: FormBuilder) {
    super();
    this.obtenerExpediente();
    this.filtroForm = this.inicializarFiltroForm();
    this.suscribirACambiosFiltro();
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
    this.antecedentesService.getExpediente('CC.NL.-0615/1999').subscribe({
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

  iniciarBusqueda(): void {
    const tipoConsulta = this.filtroForm.get('filtro')?.value;
    const valor = this.filtroForm.get('valor')?.value;

    if (this.filtroForm.invalid) {
      this._alertServices.informacion('Debe seleccionar el filtro y proporcionar el valor de búsqueda.');
      return;
    }

    // Limpiar consultas y totales anteriores
    this.consultas = [];
    this.totalAntecedentes = null as any;

    // Construir las estructuras ResultadoConsulta necesarias

    if (tipoConsulta === 1) { // Caso 1: Búsqueda por NSS (solo tabla NSS)
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

    }

    if (tipoConsulta === 2) { // Caso 2: Búsqueda por Nombre (solo tabla Nombre)
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

    // this.ejecutarConsultaTotal();

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
        consulta.data.set(dataResponse.content || []);
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
    }
  }

  generarSolicitudAntecedentesNombre(valor: string): SolicitudAntecedentes {
    return {
      expediente: 'CC.NL.-0621/2016',
      nombre: valor,
      nss: null
    }
  }

  generarSolicitudAntecedentesNSS(valor: string): SolicitudAntecedentes {
    return {
      expediente: 'CC.NL.-0621/2016',
      nombre: null,
      nss: valor
    }
  }


  cargarPagina(event: any) {
    console.log("Paginación:", event);
  }

  cambiarEstado(event: any) {
    console.log("Checkbox cambiado:", event);
  }


  protected readonly tipoconsulta = TIPO_CONSULTA_ANTECEDENTES;
}
