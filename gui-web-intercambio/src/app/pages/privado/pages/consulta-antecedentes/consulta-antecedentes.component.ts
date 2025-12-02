import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { GeneralComponent } from '@components/general.component';
import { ColumnDefinition } from '@models/columa-tabla';
import { Tipoconsulta } from '@models/tipo-consulta';
import { TipoDropdown } from '@models/tipo-dropdown.interface';
import { TablaPrincipalComponent } from '@pages/privado/shared/tabla-principal/tabla-principal.component';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-consulta-antecedentes',
  imports: [  CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule,TablaPrincipalComponent],
  templateUrl: './consulta-antecedentes.component.html',
  styleUrl: './consulta-antecedentes.component.scss'
})
export class ConsultaAntecedentesComponent extends GeneralComponent implements OnInit {
   tipoconsulta: TipoDropdown[] = []
    
    filtroForm!: FormGroup;

   columns: ColumnDefinition[] = [
  { field: 'asociar', header: 'Asociar', checkbox: true },
  { field: 'nss', header: 'NSS' },
  { field: 'nombre', header: 'Nombre' },   // 👈 checkbox
  { field: 'apaterno', header: 'Apellido paterno' },
  { field: 'visualizar', header: 'Visualizar', frozen: true },
  { field: 'imprimir', header: 'Imprimir', frozen: true }
];

data = [
  { asociar: false,nss:"123456789",nombre: "Juan", apaterno: "Pérez", visualizar: true, imprimir: true },
  { asociar: false,nss:"123456789",nombre: "Juan", apaterno: "Pérez", visualizar: true, imprimir: true },
];
  constructor(private fb: FormBuilder) {
    super();
  }
   ngOnInit(): void {

     this.tipoconsulta = [
       { label: 'NSS', value: 1 },
       { label: 'Nombre y apellidos', value: 2 },
       { label: 'Ambos', value: 3 },
       
     ];

     this.filtroForm=this.inicializarFiltroForm()

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
    nss: [{ value: null, disabled: false}], // Sin required inicial
    nombre: [{ value: null, disabled: false}], // Sin required inicial
    apaterno: [{ value: null, disabled: false}],
    amaterno: [{ value: null, disabled: false}] // Sin required inicial
  }, { validators: this.validacionCondicional() }); // <--- CLAVE: El validador de grupo
}

onTipoConsultaChange(event: any) {
  const tipo = event.value?.value;

  const nss = this.filtroForm.get('nss');
  const nombre = this.filtroForm.get('nombre');
  const apaterno = this.filtroForm.get('apaterno');
  const amaterno = this.filtroForm.get('amaterno');

  // Limpiar validators antes de asignar nuevos
  nss?.clearValidators();
  nombre?.clearValidators();
  apaterno?.clearValidators();
  amaterno?.clearValidators();

  // Deshabilitar todo primero
  nss?.disable();
  nombre?.disable();
  apaterno?.disable();
  amaterno?.disable();

  if (tipo === 1) { // NSS
    nss?.enable();
    nss?.setValidators([Validators.required]);

  } else if (tipo === 2) { // Nombre y apellidos
    nombre?.enable(); apaterno?.enable(); amaterno?.enable();
    nombre?.setValidators([Validators.required]);
    apaterno?.setValidators([Validators.required]);
    amaterno?.setValidators([Validators.required]);

  } else if (tipo === 3) { // Ambos
    nss?.enable();
    nombre?.enable(); apaterno?.enable(); amaterno?.enable();
    nss?.setValidators([Validators.required]);
    nombre?.setValidators([Validators.required]);
    apaterno?.setValidators([Validators.required]);
    amaterno?.setValidators([Validators.required]);
  }

  // Actualizar cambios
  nss?.updateValueAndValidity();
  nombre?.updateValueAndValidity();
  apaterno?.updateValueAndValidity();
  amaterno?.updateValueAndValidity();

  // Reevaluar validador global
  this.filtroForm.updateValueAndValidity();
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
      if (!nombre || !apaterno || !amaterno) valido = false;
    } else if (tipoconsulta === 3) {
      if (!nss || !nombre || !apaterno || !amaterno) valido = false;
    }

    return valido ? null : { camposRequeridosFaltantes: true };
  };
}

paginar(){}
limpiar(){}

  
}
