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

tituloTabla: string = 'Resultados de la búsqueda';
tituloTablanombre: string = 'Resultados de la búsqueda';
totalregistros: number = 0;
totalregistrosnombre: number = 0;

data:any[] = [
  ];
  data_nombre:any=[];
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
  inicializatabla(){
    this.data = [
  { asociar: false,nss:"17482569321",nombre: "Juan", apaterno: "Pérez", amaterno:"López",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
  { asociar: false,nss:"00234567890",nombre: "Jose de Jesus", apaterno: "Pérez", amaterno:"López",gestion:2,queja:1,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
];
  }

    inicializatablaNombre(){
    this.data_nombre = [
  { asociar: false,nss:"123456789",nombre: "Ricardo", apaterno: "Palma", amaterno:"García",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
  { asociar: false,nss:"123456789",nombre: "Ricardo", apaterno: "Palma", amaterno:"López",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
 { asociar: false,nss:"123456789",nombre: "Ricardo", apaterno: "Palma", amaterno:"Hernández",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
 { asociar: false,nss:"123456789",nombre: "Ricardo", apaterno: "Palma", amaterno:"Ramírez",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
  { asociar: false,nss:"123456789",nombre: "Ricardo", apaterno: "Palma", amaterno:"Vazquez",gestion:1,queja:0,inconformidades:0,amparo:1,procedimiento:0,juicio:1} ,
];
this.totalregistrosnombre=this.data_nombre.length;
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
  this.limpiar();
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
    

  } else if (tipo === 3) { // Ambos
    nss?.enable();
    nombre?.enable(); apaterno?.enable(); amaterno?.enable();
    nss?.setValidators([Validators.required]);
    nombre?.setValidators([Validators.required]);
    apaterno?.setValidators([Validators.required]);
   
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
      if (!nombre || !apaterno ) valido = false;
    } else if (tipoconsulta === 3) {
      if (!nss || !nombre || !apaterno ) valido = false;
    }

    return valido ? null : { camposRequeridosFaltantes: true };
  };
}

paginar(){

  const tipo = this.filtroForm.get('tipoconsulta');
  const nss = this.filtroForm.get('nss');
  const nombre = this.filtroForm.get('nombre');
  const apaterno = this.filtroForm.get('apaterno');
  const amaterno = this.filtroForm.get('amaterno');
  console.log("Tipo de consulta:", tipo?.value.value);
  if(tipo?.value.value==1){
    if(nss?.value=='94987906512'){
       this._alertServices.error('Sin coincidencias');
    }else{
      this.tituloTabla='Resultados de la búsqueda por NSS: '+nss?.value;
      console.log("Título de la tabla:", this.tituloTabla);
      this.inicializatabla();
    }

  }else if(tipo?.value.value==2){
    if(nombre?.value=='Juan' && apaterno?.value=='Pérez'){
       this._alertServices.error('Sin coincidencias');
    }else{
      this.tituloTabla='Resultados de la búsqueda por nombre y primer aplellido: '+nombre?.value + ' ' + apaterno?.value;
      this.inicializatabla();
    }
  }else{
    this.tituloTabla='Resultados de la búsqueda por NSS: '+nss?.value;
    this.tituloTablanombre='Resultados de la búsqueda por nombre y primer aplellido: '+nombre?.value + ' ' + apaterno?.value;
    this.inicializatabla();
    this.inicializatablaNombre();
  }
}
limpiar(){
  this.data = [];  
  this.filtroForm.patchValue({
  nss: null,
  nombre: null,
  apaterno: null,
  amaterno: null
});
}

  
}
