import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
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
  tipoconsulta: TipoDropdown[] = TIPO_CONSULTA_ANTECEDENTES;

  filtroForm!: FormGroup;

  tituloTabla: string = 'Resultados de la búsqueda';
  tituloTablanombre: string = 'Resultados de la búsqueda';

  totalregistros: number = 0;
  totalregistrosnombre: number = 0;

  data: any[] = [];
  data_nombre: any = [];

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
      nss: [{value: null, disabled: false}], // Sin required inicial
      nombre: [{value: null, disabled: false}], // Sin required inicial
      apaterno: [{value: null, disabled: false}],
      amaterno: [{value: null, disabled: false}] // Sin required inicial
    }, {validators: this.validacionCondicional()}); // <--- CLAVE: El validador de grupo
  }

  validacionCondicional(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {

      const tipoconsulta = group.get('tipoconsulta')?.value?.value;
      const nss = group.get('nss')?.value;
      const nombre = group.get('nombre')?.value;
      const apaterno = group.get('apaterno')?.value;
      const amaterno = group.get('amaterno')?.value;

      if (!tipoconsulta) return null;

      let valido = true;

      // 1 = NSS, 2 = Nombre y apellidos, 3 = Ambos
      if (tipoconsulta === 1) {
        if (!nss) valido = false;
      } else if (tipoconsulta === 2) {
        if (!nombre || !apaterno) valido = false;
      } else if (tipoconsulta === 3) {
        if (!nss || !nombre || !apaterno) valido = false;
      }

      return valido ? null : {camposRequeridosFaltantes: true};
    };
  }

  paginar() {

    const tipo = this.filtroForm.get('tipoconsulta');
    const nss = this.filtroForm.get('nss');
    const nombre = this.filtroForm.get('nombre');
    const apaterno = this.filtroForm.get('apaterno');
    const amaterno = this.filtroForm.get('amaterno');
    console.log("Tipo de consulta:", tipo?.value.value);
    if (tipo?.value.value == 1) {
      if (nss?.value == '94987906512') {
        this._alertServices.error('Sin coincidencias');
      } else {
        this.tituloTabla = 'Resultados de la búsqueda por NSS: ' + nss?.value;
        console.log("Título de la tabla:", this.tituloTabla);
      }

    } else if (tipo?.value.value == 2) {
      if (nombre?.value == 'Juan' && apaterno?.value == 'Pérez') {
        this._alertServices.error('Sin coincidencias');
      } else {
        this.tituloTabla = 'Resultados de la búsqueda por nombre y primer aplellido: ' + nombre?.value + ' ' + apaterno?.value;
      }
    } else {
      this.tituloTabla = 'Resultados de la búsqueda por NSS: ' + nss?.value;
      this.tituloTablanombre = 'Resultados de la búsqueda por nombre y primer aplellido: ' + nombre?.value + ' ' + apaterno?.value;
    }
  }

  limpiar(): void {
    this.limpiarValidadores();
    this.filtroForm.patchValue({});
  }

}
