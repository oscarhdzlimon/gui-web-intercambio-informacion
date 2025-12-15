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
import {forkJoin} from 'rxjs';
import {TotalesAntecedentes} from '../../../../core/interfaces/totales-antecedentes.interface';
import {RegistroAntecedentes} from '../../../../core/interfaces/registro-antecedentes.interface';

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

  filtroForm!: FormGroup;

  tituloTabla: string = 'Resultados de la búsqueda';
  tituloTablanombre: string = 'Resultados de la búsqueda';

  registrosPorPagina: number = 5;
  paginaActual: number = 0;

  totalregistros: number = 0;
  totalregistrosnombre: number = 0;

  data: WritableSignal<RegistroAntecedentes[]> = signal([]);
  data_nombre: any = [];

  totalAntecedentes!: TotalesAntecedentes

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.filtroForm = this.inicializarFiltroForm();
    this.suscribirATipoConsulta();
  }

  suscribirATipoConsulta(): void {
    this.filtroForm.get('tipoconsulta')?.valueChanges
      .pipe(filter(value => value !== null && value !== undefined))
      .subscribe(event => {
        const tipo = typeof event === 'object' && event !== null && 'value' in event ? event.value : event;
        this.limpiarValidadores();
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
      control?.disable();
    });

  }

  cargarPagina(event: any) {
    console.log("Paginación:", event);
  }

  cambiarEstado(event: any) {
    console.log("Checkbox cambiado:", event);
  }

  inicializarFiltroForm(): FormGroup {
    return this.fb.group({
      tipoconsulta: ['', Validators.required], // Este siempre es requerido
      nss: [{value: null, disabled: true}], // Sin required inicial
      nombre: [{value: null, disabled: true}], // Sin required inicial
      apaterno: [{value: null, disabled: true}],
      amaterno: [{value: null, disabled: true}] // Sin required inicial
    });
  }

  paginar() {
    if (this.filtroForm.invalid) return;
    const solicitud: SolicitudAntecedentes = this.generarSolicitudAntecedentes();
    forkJoin([
      this.antecedentesService.getLstAntecedentes(this.registrosPorPagina, this.paginaActual, solicitud),
      this.antecedentesService.getTotalAntecedentes(solicitud)
    ]).subscribe({
      next: ([dataResponse, totalResponse]) => {
        // Actualizar la lista de la página
        this.data.update(() => dataResponse.content);

        // Actualizar el total de registros
        this.totalAntecedentes = totalResponse;

        if (this.data().length === 0) {
          this._alertServices.informacion('No se encontraron antecedentes con los criterios seleccionados.');
        }

      },
      error: (error) => {
        this._alertServices.error('Ocurrió un error al obtener los antecedentes.');
        console.error('Error al paginar/obtener totales:', error);
        this.data.update(() => []);
        this.totalregistros = 0;
      }
    });
  }

  generarSolicitudAntecedentes(): SolicitudAntecedentes {
    return {
      expediente: 'CC.NL.-0621/2016',
      nombre: this.generarNombre(),
      nss: this.filtroForm.get('nss')?.value
    }
  }

  generarNombre(): string | null {
    return this.filtroForm.get('nombre')?.value === null
      ? null // Devuelve null si el nombre es estrictamente null (o no existe el control)
      : [
        this.filtroForm.get('nombre')?.value,
        this.filtroForm.get('apaterno')?.value,
        this.filtroForm.get('amaterno')?.value
      ]
        // Filtra los valores que son null, undefined o cadenas vacías ('')
        .filter(segmento => !!segmento)
        // Une los segmentos restantes con un espacio.
        .join(' ');
  }

  limpiar(): void {
    this.limpiarValidadores();
    this.filtroForm.patchValue({});
    this.data.update(() => []);
  }

}
