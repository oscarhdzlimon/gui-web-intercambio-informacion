import {CommonModule} from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  WritableSignal
} from '@angular/core';
import {
  AbstractControl, FormArray,
  FormBuilder, FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {AccordionModule} from 'primeng/accordion';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TabsModule} from 'primeng/tabs';
import {TextareaModule} from 'primeng/textarea';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {DetalleDocumentacionEspecialidadDocumento} from '@models/detalleDocumentacionAspirante.interface';
import {DocumentoService} from '@services/documentos.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {VerificacionDocsService} from '@services/verificacion-docs.service';
import {RouterLink} from '@angular/router';
import {AlertService} from '@services/alert.service';
import {Mensajes} from '@utils/mensajes';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-docs-especialidad',
  imports: [AccordionModule,
    RadioButtonModule,
    TabsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextareaModule,
    CardModule,
    ButtonModule,
    RouterLink,
    DialogModule
  ],
  templateUrl: './docs-especialidad.component.html',
  styleUrl: './docs-especialidad.component.scss'
})
export class DocsEspecialidadComponent implements OnInit {

  @Input() docsEspecialidad: DetalleDocumentacionEspecialidadDocumento[] = [];
  @Input() idUsuario: number | null = null;
  @Input() observaciones: string = '';
  @Input() estatusId: number | null = null;

  @Output() actualizarRegistro: EventEmitter<boolean> = new EventEmitter();

  private readonly MOBILE_BREAKPOINT = 984;

  isMobileView: boolean = false;

  formularioValidacion!: FormGroup;

  formSeleccionado!: FormGroup;

  verificacionDocsService: VerificacionDocsService = inject(VerificacionDocsService)

  pdfUrl: SafeResourceUrl | undefined;

  documentoService = inject(DocumentoService)

  confCambioEstatus: boolean = false;
  estatusPrevio: string = "";

  credentialOptions = [
    {label: 'Cubre', value: '1'},
    {label: 'No cubre', value: '0'}
  ];

  estatusDocumentos = [
    {label: 'Cumple con requisitos', value: '3'},
    {label: 'No cumple con requisitos', value: '4'},
    {label: 'Revisión documental', value: '2'},
  ];

  tabActive: WritableSignal<number> = signal(0);

  alertaService = inject(AlertService);

  mensajes: Mensajes = new Mensajes();

  constructor(
    private readonly fb: FormBuilder,
    private readonly sanitizer: DomSanitizer
  ) {
    this.checkScreenSize();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  ngOnInit(): void {
    this.formularioValidacion = this.fb.group({
      datosPersonales: this.fb.group({
        idUsuario: [this.idUsuario, Validators.required]
      }),
      refObservaciones: [this.observaciones, [Validators.required]],
      especialidadesDocumentos: this.fb.array(
        this.docsEspecialidad.map(especialidad =>
          this.crearGrupoEspecialidad(especialidad)
        )
      )
    });
    this.formularioValidacion.updateValueAndValidity();
  }

  crearGrupoEspecialidad(especialidad: DetalleDocumentacionEspecialidadDocumento): FormGroup {
    const documentosArray = especialidad.documentosEspecialidad.map(doc =>
      this.fb.group({
        idDocumentoEspecialidad: [doc.idDocumentoEspecialidad],
        // Convertir '1' a true, '0' a false, y null a false
        indCubre: [doc.indCubre ?? null]
      }));

    const idEstatusVerificacionInicial = especialidad.evaluacionEspecialidad
      ? (especialidad.evaluacionEspecialidad as any)?.estatusVerificacion?.idEstatusVerificacion.toString() || null
      : null;

    const especialidadGroup = this.fb.group({
      idEspecialidadDocumento: [especialidad.idEspecialidadDocumento],
      cveEspecialidad: [especialidad.cveEspecialidad],
      desEspecialidad: [especialidad.desEspecialidad],
      documentosEspecialidad: this.fb.array(documentosArray),
      evaluacionEspecialidad: this.fb.group({
        idEspecialidadEvaluacion: [especialidad.evaluacionEspecialidad?.idEspecialidadEvaluacion ?? null],
        estatusVerificacion: this.fb.group({
          idEstatusVerificacion: [idEstatusVerificacionInicial]
        })
      })
    }, {validators: [this.estatusEspecialidadValidator.bind(this)]});

    this.setupEstatusValidation(especialidadGroup);

    return especialidadGroup;
  }

  setupEstatusValidation(especialidadGroup: FormGroup): void {
    const documentosArray = especialidadGroup.get('documentosEspecialidad') as FormArray;
    const estatusControl = especialidadGroup.get('evaluacionEspecialidad')?.get('estatusVerificacion')?.get('idEstatusVerificacion') as FormControl;

    if (!documentosArray || !estatusControl) {
      return;
    }

    this.updateEstatusControlState(especialidadGroup);

    // Se Suscribe a los cambios en el FormArray de documentos
    documentosArray.valueChanges.subscribe(() => {
      this.updateEstatusControlState(especialidadGroup);
    });
  }

  updateEstatusControlState(especialidadGroup: FormGroup): void {
    const documentosArray = especialidadGroup.get('documentosEspecialidad') as FormArray;
    const estatusControl = especialidadGroup.get('evaluacionEspecialidad')?.get('estatusVerificacion')?.get('idEstatusVerificacion') as FormControl;

    if (!documentosArray || !estatusControl) {
      return;
    }

    const valoresDocumentos = documentosArray.controls
      .map(control => control.get('indCubre')?.value)
      .filter(val => val !== null); // Solo los que tienen valor ('1' o '0')

    const ningunDocumentoMarcado = valoresDocumentos.length === 0;

    if (ningunDocumentoMarcado) {
      // Condición: Si no se marca ningún documento, las opciones deben estar deshabilitadas.
      estatusControl.disable({emitEvent: false}); // Deshabilita el control
      estatusControl.clearValidators();           // Elimina el validador de requerido
      estatusControl.setValue(null, {emitEvent: false}); // Limpia el valor
    } else {
      // Condición: Si se marca al menos uno, el control se habilita y se hace requerido.
      estatusControl.enable({emitEvent: false});
      estatusControl.setValidators(Validators.required);

      const opcionesPermitidas = this.getEstatusVerificacionOptions(especialidadGroup);
      if (estatusControl.value !== null && !opcionesPermitidas.some(o => o.value === estatusControl.value)) {
        estatusControl.setValue(null, {emitEvent: false});
      }
    }

    // Revalida el control y el formulario principal para actualizar el `[disabled]` del botón.
    estatusControl.updateValueAndValidity({emitEvent: false});
    if (this.formularioValidacion) {
      this.formularioValidacion.updateValueAndValidity();
    }
  }

  getEstatusVerificacionOptions(especialidadGroup: FormGroup): any[] {
    const documentosArray = especialidadGroup.get('documentosEspecialidad') as FormArray;

    if (!documentosArray) {
      return [];
    }

    // Obtener y filtrar solo los documentos que ya fueron marcados ('1' o '0')
    const valoresDocumentos = documentosArray.controls
      .map(control => control.get('indCubre')?.value)
      .filter(val => val !== null);

    const alMenosUnCubre = valoresDocumentos.some(val => val === true); // '1' = Cubre
    const todosSonNoCubre = valoresDocumentos.length > 0 && valoresDocumentos.every(val => val === false); // '0' = No cubre
    const ningunDocumentoMarcado = valoresDocumentos.length === 0;

    // Condición 3: Si no se marca ningun documento
    if (ningunDocumentoMarcado) {
      return [];
    }

    // Condición 1: Si al menos un documento es "Cubre"
    if (alMenosUnCubre) {
      // Estatus permitidos: Cumple con Requisitos (3), No Cumple con Requisitos (4), Revisión Documental (2)
      return this.estatusDocumentos.filter(estatus =>
        ['3', '4', '2'].includes(estatus.value)
      );
    }

    // Condición 2: Si todos los documentos marcados son "No cubre"
    if (todosSonNoCubre) {
      // Estatus permitidos: No Cumple con Requisitos (4), Revisión Documental (2)
      return this.estatusDocumentos.filter(estatus =>
        ['4', '2'].includes(estatus.value)
      );
    }

    // Fallback (nunca debería alcanzarse si las condiciones son mutuamente excluyentes y correctas)
    return [];
  }

  estatusRequisitoCambio(form: FormGroup, prev: any){
    if(form.get('idEstatusVerificacion')?.value == '3'){
      this.estatusPrevio = prev.evaluacionEspecialidad.estatusVerificacion?.idEstatusVerificacion.toString();
      this.confCambioEstatus = true
      this.formSeleccionado = form;
    }
  }

  cambiarEstatus(cambio: boolean){
    this.confCambioEstatus = false;
    if(!cambio)this.formSeleccionado.get('idEstatusVerificacion')?.setValue(this.estatusPrevio);
  }

  docSeleccionado(id: number, guid: string) {
    this.tabActive.set(id);
    this.obtenerPrevisualizacionDocumento(guid);
  }

  obtenerPrevisualizacionDocumento(guid: string) {
    this.documentoService.obtenerDocumento(guid).subscribe({
      next: (response) => {
        const blob = new Blob([response], {type: 'application/pdf'});
        const url = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (err) => {
        console.error('Error al obtener el documento', err);
      }
    });
  }

  private estatusEspecialidadValidator(control: AbstractControl): { [key: string]: any } | null {
    // control es el FormGroup de la especialidad
    const estatusControl = control.get('evaluacionEspecialidad')?.get('estatusVerificacion')?.get('idEstatusVerificacion') as FormControl;
    const documentosArray = control.get('documentosEspecialidad') as FormArray;

    // Si no hay estatus seleccionado, salimos y dejamos que Validators.required actúe.
    if (!estatusControl || !documentosArray || estatusControl.value === null) {
      return null;
    }

    // Lógica para determinar los valores permitidos (extraída de getEstatusVerificacionOptions)
    const valoresDocumentos = documentosArray.controls
      .map(docControl => docControl.get('indCubre')?.value)
      .filter(val => val !== null); // [true, false, ...]

    const alMenosUnCubre = valoresDocumentos.some(val => val === true);
    const ningunDocumentoMarcado = valoresDocumentos.length === 0;

    let allowedValues: string[] = [];

    if (ningunDocumentoMarcado) {
      allowedValues = []; // Nunca debería ser válido si está habilitado
    } else if (alMenosUnCubre) {
      // Regla 1: Cubre -> Permite 3, 4, 2
      allowedValues = ['3', '4', '2'];
    } else {
      // Regla 2: Solo No Cubre -> Permite 4, 2
      allowedValues = ['4', '2'];
    }

    const selectedValue = estatusControl.value;

    // 2. Verificar si el valor seleccionado está en la lista de permitidos
    if (allowedValues.includes(selectedValue)) {
      return null; // Válido
    } else {
      // Inválido: Marca el FormGroup de la especialidad como inválido.
      return {estatusNoPermitido: true, allowed: allowedValues};
    }
  }

  // Getter para acceder al FormArray principal (ya deberías tenerlo)
  get especialidadesDocumentosArray(): FormArray {
    return this.formularioValidacion.get('especialidadesDocumentos') as FormArray;
  }

// Función para obtener el FormGroup de una especialidad específica por índice
  getEspecialidadGroup(index: number): FormGroup {
    return this.especialidadesDocumentosArray.at(index) as FormGroup;
  }

// Función para obtener el FormArray de documentos de una especialidad específica
  getDocumentosArray(index: number): FormArray {
    return this.getEspecialidadGroup(index).get('documentosEspecialidad') as FormArray;
  }

// Función para obtener el FormControl específico (usado para [formControl])
  getFormControl(parentControl: AbstractControl, controlName: string): FormControl {
    return parentControl.get(controlName) as FormControl;
  }

// Función para obtener el FormGroup de estatus de verificación
  getEstatusGroup(index: number): FormGroup {
    return this.getEspecialidadGroup(index).get('evaluacionEspecialidad')?.get('estatusVerificacion') as FormGroup;
  }

  finalizarVerificacion(): void {
    if (this.formularioValidacion.invalid) {
      console.error("El formulario es inválido. Revise los campos requeridos.");
      return;
    }

    const solicitud = this.formularioValidacion.getRawValue();
    solicitud.especialidadesDocumentos = solicitud.especialidadesDocumentos.map(
      (especialidad: any) => {
        const idEstatus = especialidad.evaluacionEspecialidad.estatusVerificacion.idEstatusVerificacion;
        const estatusSeleccionado = this.estatusDocumentos.find(o => o.value === idEstatus);
        if (estatusSeleccionado) {
          especialidad.evaluacionEspecialidad.estatusVerificacion.desEstatus = estatusSeleccionado.label;
        }

        return especialidad;
      }
    );

    this.verificacionDocsService.verificarRegistro(solicitud).subscribe({
      next: (respuesta) => {
        if (!respuesta.exito) return;
        this.alertaService.exito(this.mensajes.MSG026);
        this.actualizarRegistro.emit(true);
      },
      error: (error) => {
        this.alertaService.error(error.mensaje);
      }
    })
  }


}
