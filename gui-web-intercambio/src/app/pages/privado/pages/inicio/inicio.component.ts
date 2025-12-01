import {Component, inject, QueryList, signal, ViewChildren, WritableSignal} from '@angular/core';
import {Card} from 'primeng/card';
import {StepsComponent} from '@components/steps/steps.component';
import {UploadPhotoComponent} from '@components/upload-photo/upload-photo.component';
import {InputText} from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {Select} from 'primeng/select';
import {DatePickerModule} from 'primeng/datepicker';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {UploadDocumentComponent} from '@components/upload-document/upload-document.component';
import {RadioButton} from 'primeng/radiobutton';
import {BOOLEAN_OPCIONES, DEPENDIENTES, INSTITUCIONES} from '@utils/constants';
import {TabPanel, TabView} from 'primeng/tabview';
import {HeaderTabComponent} from '@components/header-tab/header-tab.component';
import {
  HeaderMedicoInternoComponent
} from '@pages/privado/shared/header-medico-interno/header-medico-interno.component';
import {EmptyTabComponent} from '@components/empty-tab/empty-tab.component';
import {TabDocumento, TabNode} from '@models/tab-node.interface';
import {ActivatedRoute} from '@angular/router';
import {TipoDropdown} from '@models/tipo-dropdown.interface';
import {mapearArregloTipoDropdown} from '@utils/funciones';
import {DatosContacto} from '@models/datosContacto';
import {GeneralComponent} from '@components/general.component';
import {UserService} from '@services/user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {Estado, Pais, Residencia} from '@models/datosDomicilio';
import {ResponseGeneral} from '@models/responseGeneral';
import {Colonia} from '@models/colonia';
import {DataFotografia, Fotografia, FotografiaRequest} from '@models/fotografia';
import {DatosPersonales} from '@models/datosPersonales';
import {Dependientes} from '@models/dependiente';
import {OnlyNumbersDirective} from '@directives/only-numbers.directive';
import {EmailAllowCaractersDirective} from '@directives/email-allow-caracters.directive';
import {EstadoCivil} from '@models/estadoCivil';
import {OfertaLaboralComponent} from '@privado/oferta-laboral/oferta-laboral.component';
import {dataGenerales, DatosGeneralesRequest, DatosGeneralesResponse} from '@models/datosGenerales';
import {InteresLaboral} from '@models/aspirante';
import dayjs from 'dayjs';
import {of, switchMap, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DocumentosLocalstorageService} from '@services/documentos-localstorage.service';
import {
  DatosEmpleo,
  DocumentoConstancia,
  DocumentoEspecialidad,
  RefDocumentoEspecialidad,
  SolicitudDocumentoObligatorio,
  SolicitudGuardarDocumentacion,
  TipoInstitucion
} from '@models/solicitud-guardar-documentacion.interface';
import {
  ItemDocumentoEspecialidad,
  RespuestaConsultaDocumentos,
  RespuestaDatosEmpleo,
  RespuestaDocumentosConstancia,
  RespuestaDocumentosEspecialidad,
  RespuestaDocumentosObligatorios
} from '@models/respuesta-consulta-documentos.interface';
import utc from "dayjs/plugin/utc";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {Checkbox} from 'primeng/checkbox';
import {CommonModule} from '@angular/common';
import {AlphanumericDirective} from '@directives/only-alphanumeric.directive';
import {PATRON_RFC} from '@utils/regex';

interface DocumentoFuente {
  refGuid: string;
  nombre: string;
}

interface EntradaDocumentos {
  [key: string]: DocumentoFuente; // Clave: '1', '2', '3', etc. (no se usará)
}

dayjs.extend(utc);
dayjs.extend(customParseFormat);

@Component({
  selector: 'app-inicio',
  imports: [
    CommonModule,
    Card,
    StepsComponent,
    UploadPhotoComponent,
    InputText,
    ReactiveFormsModule,
    Select,
    DatePickerModule,
    Button,
    TableModule,
    UploadDocumentComponent,
    RadioButton,
    Checkbox,
    TabPanel,
    TabView,
    HeaderTabComponent,
    FormsModule,
    HeaderMedicoInternoComponent,
    EmptyTabComponent,
    OnlyNumbersDirective,
    EmailAllowCaractersDirective,
    OfertaLaboralComponent,
    AlphanumericDirective,
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})

export class InicioComponent extends GeneralComponent {
  @ViewChildren(UploadDocumentComponent)
  uploaders!: QueryList<UploadDocumentComponent>;

  readonly dependientes = DEPENDIENTES;
  readonly instituciones = INSTITUCIONES;
  readonly opciones_boolean = BOOLEAN_OPCIONES;

  userService = inject(UserService);
  fb: FormBuilder = inject(FormBuilder);
  documentosLocalStorageService = inject(DocumentosLocalstorageService)
  formRegistro!: FormGroup;
  formZonaInteres!: FormGroup;
  formDocumentosEspecialidad!: FormGroup;
  formDatosEmpleo!: FormGroup;
  userData: SesionUser | null = null;

  zonasInteres: WritableSignal<any[]> = signal([]);
  registrosDocumentosEspecialidad: WritableSignal<TabNode[]> = signal([]);

  blnFotoGuardada!: boolean;

  steps = [
    {label: 'Información personal', active: false},
    {label: 'Documentos de escolaridad', active: false},
    {label: 'Oferta laboral', active: false},
  ];

  datosGenerales!: DatosGeneralesResponse;
  selectFile!: File | undefined;
  defaultFile!: File | undefined;
  datosFoto!: Fotografia;
  sexos: TipoDropdown[] = [];
  estadosCiviles: TipoDropdown[] = [];
  paises: TipoDropdown[] = [];
  lstTiposDocumentos: TipoDropdown[] = [];
  lugaresNacimiento: TipoDropdown[] = [];
  estados: TipoDropdown[] = [];
  municipios: TipoDropdown[] = [];
  colonias: TipoDropdown[] = [];
  ooad: TipoDropdown[] = [];
  zonas: TipoDropdown[] = [];
  especialidades: TipoDropdown[] = [];
  dias_semana: TipoDropdown[] = [];

  indice: WritableSignal<number> = signal<number>(0);
  tipoMedico: WritableSignal<string> = signal<string>("");

  archivoINE!: File | null;
  archivoTitulo!: File | null;
  archivoCedula!: File | null;

  documentoEspecialidad!: File | null;

  archivoConstancia1!: File | null;
  archivoConstancia2!: File | null;
  archivoConstancia3!: File | null;

  nombreConstancia1: string = '';
  nombreConstancia2: string = '';
  nombreConstancia3: string = '';

  idDocumentoINE: number | undefined;
  idDocumentoCedula: number | undefined;
  idDocumentoTitulo: number | undefined;

  idDocumentoConstancia1: number | undefined;
  idDocumentoConstancia2: number | undefined;
  idDocumentoConstancia3: number | undefined;

  estatusPendienteDocumentacion: boolean = false;
  estatusValidacionCompletada: boolean = false;

  constanciasPorEliminar: number[] = [];

  especialidadesPorEliminar: number[] = [];
  needsCleanup: boolean = false;


  constructor(private readonly activatedRoute: ActivatedRoute) {
    super()
    this.documentosLocalStorageService.limpiar();
    this.userService.userData$.subscribe(user => this.userData = user);
    this.formRegistro = this.asignarFormularioRegistro();
    this.formZonaInteres = this.asignarFormularioZonaInteres();
    this.formDocumentosEspecialidad = this.asignarFormularioDocumentosEspecialidad();
    this.formDatosEmpleo = this.asignarFormularioDatosEmpleo();
    this.obtenerCatalogos();
    this.suscribirObservables();
    this.subscribirseACambioComponentes();
    this.settearDatosUsuario();
    this.obtenerDatosGenerales(this.userData?.idUsuario);
    this.obtenerDatosFoto(this.userData?.idUsuario);
    this.obtenerDatosDocumentosEscolaridad();
    this.revisarDocumentosLocalHost();
    this.suscribirObservablesDatosEmpleo();
  }

  recargarInfo() {
    this.obtenerDatosGenerales(this.userData?.idUsuario);
    this.obtenerDatosFoto(this.userData?.idUsuario);
    this.obtenerDatosDocumentosEscolaridad();
  }

  asignarFormularioRegistro(): FormGroup {
    return this.fb.group({
      rfc: [{value: ''}, [Validators.required, Validators.minLength(13), Validators.maxLength(13), Validators.pattern(PATRON_RFC)]],
      nss: [{value: '', disabled: false}, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      fechaNacimiento: [null, [Validators.required]],
      sexo: [{value: ''}, [Validators.required]],
      estadoCivil: [{value: '', disabled: false}, [Validators.required]],
      indPadres: [false],
      indConyuge: [false],
      indHijos: [false],
      indOtros: [false],
      indNinguno:[false],
      hijos: [{value: '', disabled: true}, [Validators.required, Validators.min(1)]],
      otros: [{value: '', disabled: true}, [Validators.required]],
      correo: [{value: '', disabled: true}],
      correoAdicional: [],
      telefonoCasa: [{
        value: '',
        disabled: false
      }, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      telefonoCelular: [{
        value: '',
        disabled: false
      }, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      paisNacimiento: [],
      estadoNacimiento: [],
      codigoPostal: [{value: '', disabled: false}, [Validators.required]],
      pais: [],
      estado: [{value: '', disabled: false}, [Validators.required]],
      municipio: [{value: '', disabled: false}, [Validators.required]],
      colonia: [{value: '', disabled: false}, [Validators.required]],
      calle: [{value: '', disabled: false}, [Validators.required]],
      numeroExterior: [{value: '', disabled: false}, [Validators.required]]
    });
  }


  suscribirObservables(): void {
    this.formRegistro.get('pais')?.valueChanges.subscribe(value => this.obtenerEstadoPorPais(value));
    this.formRegistro.get('estado')?.valueChanges.subscribe(value => this.obtenerMunicipioPorEstado(value));
    //this.formRegistro.get('municipio')?.valueChanges.subscribe(value => this.obtenerAlcaldiaPorMunicipio(value));
    this.formZonaInteres.get('ooad')?.valueChanges.subscribe(value => {
        this.zonas = [];
        this.obtenerZonasPorMunicipio(value);
      }
    )
    this.formRegistro.get('paisNacimiento')?.valueChanges.subscribe((value) => {
        this.formRegistro.get('estadoNacimiento')?.disable()
        this.formRegistro.get('estadoNacimiento')?.reset();
        if (value?.value == 103) {
          this.formRegistro.get('estadoNacimiento')?.enable()
        }
      }
    );

    this.formRegistro.get('indHijos')?.valueChanges.subscribe(value => {
      if (value) {
        this.formRegistro.get('indNinguno')?.reset();
        this.formRegistro.get("hijos")?.enable();
      } else {
        this.formRegistro.get("hijos")?.setValue('');
        this.formRegistro.get("hijos")?.disable();
      }
    });

    this.formRegistro.get('indOtros')?.valueChanges.subscribe(value => {
      if (value) {
        this.formRegistro.get('indNinguno')?.reset();
        this.formRegistro.get("otros")?.enable();
      } else {
        this.formRegistro.get("otros")?.setValue('');
        this.formRegistro.get("otros")?.disable();
      }
    });


    this.formRegistro.get('indNinguno')?.valueChanges.subscribe(value => {
      if(value){
        this.formRegistro.get("indPadres")?.reset();
        this.formRegistro.get("indHijos")?.reset();
        this.formRegistro.get("indConyuge")?.reset();
        this.formRegistro.get("indOtros")?.reset();
        this.formRegistro.get("hijos")?.reset();
        this.formRegistro.get("otros")?.reset();
        this.formRegistro.get("hijos")?.disable();
        this.formRegistro.get("otros")?.disable();
      }      
    });

    this.formRegistro.get('indPadres')?.valueChanges.subscribe(value => {
      if(value)this.formRegistro.get('indNinguno')?.reset();
      
    });
    this.formRegistro.get('indConyuge')?.valueChanges.subscribe(value => {
      if(value)this.formRegistro.get('indNinguno')?.reset();
      
    });
  }

  settearDatosUsuario(): void {
    if (!this.userData) {
      return;
    }

    const {refCurp, refEmail} = this.userData;
    let fecha;

    //SI EL USUARIO NO TRAE CURP LO SIGUIENTE NO FUNCIONA

    const sexo = this.obtenerSexoDeCurp(refCurp + '');
    if (sexo) {
      this.formRegistro.get('sexo')?.setValue(sexo);
    } else {
      this.formRegistro.get('sexo')?.enable();
    }
    if (refCurp) {
      fecha = this.obtenerFechaNacimientoDeCURP(refCurp + '')
      this.formRegistro.get('fechaNacimiento')?.setValue(fecha);
    } else {
      this.formRegistro.get('fechaNacimiento')?.enable();
    }


    this.formRegistro.get('correo')?.setValue(refEmail + '');
    this.userService.userData$.subscribe({
      next: (element) => {
        if (!element) return;
        this.tipoMedico.set(element.perfil)
      }
    });

  }

  asignarFormularioDatosEmpleo(): FormGroup {
    return this.fb.group({
        otroEmpleo: [{value: '0', disabled: false}],
        sustituto: [{value: '0', disabled: false}],
        tipoInstitucion: [null],
        nombreInstitucion: [{value: null, disabled: true}, [Validators.maxLength(200)]],
        horarioInicio: [{value: null, disabled: true}],
        horarioFin: [{value: null, disabled: true}],
        diaInicio: [{value: null, disabled: true}],
        diaFin: [{value: null, disabled: true}],
        ooad: [{value: null, disabled: true}],
      }
    )
  }

  obtenerFechaNacimientoDeCURP(curp: string): Date {
    const anioNum: number = Number.parseInt(curp.substring(4, 6), 10);
    const mesNum: number = Number.parseInt(curp.substring(6, 8), 10);
    const diaNum: number = Number.parseInt(curp.substring(8, 10), 10);

    let anioCompleto: number;

    const currentYearSuffix: number = new Date().getFullYear() % 100;

    if (anioNum > currentYearSuffix) {
      anioCompleto = 1900 + anioNum;
    } else {
      anioCompleto = 2000 + anioNum;
    }

    return new Date(anioCompleto, mesNum - 1, diaNum);
  }


  obtenerFechaDesdeCadena(fecha: string): Date | null {

    const partes = fecha.split('/');

    // El orden de Date es: Año, Mes (0-11), Día
    // Restamos 1 al mes porque en JavaScript Enero es 0 y Diciembre es 11.
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const anio = parseInt(partes[2], 10);

      return new Date(anio, mes, dia);
    }

    return null;
  }

  obtenerSexoDeCurp(curp: string): any {
    if (!curp || curp.length < 11) {
      return null;
    }

    const codigoSexo = curp[10];
    const sexosMap: { [key: string]: any } = {
      'H': this.sexos.find(sexo => sexo.label === 'Hombre'),
      'M': this.sexos.find(sexo => sexo.label === 'Mujer')
    };

    return sexosMap[codigoSexo] || null;
  }

  subscribirseACambioComponentes(): void {
    this.formRegistro.get('dependientes')?.valueChanges.subscribe(value => {
        this.formRegistro.get('hijos')?.disable();
        this.formRegistro.get('otros')?.disable();
        this.formRegistro.get('hijos')?.patchValue(null);
        this.formRegistro.get('otros')?.patchValue(null);
        this.formRegistro.get('hijos')?.reset();
        this.formRegistro.get('otros')?.reset();

        const [, Hijos, , Otros] = this.dependientes;
        if (value === Hijos) {
          this.formRegistro.get('hijos')?.enable();
        }
        if (value === Otros) {
          this.formRegistro.get('otros')?.enable();
        }
      }
    );
  }

  obtenerLocalidadPorPais(pais: number): void {
  }

  validarCP() {
    this._CatalogoGenService.getLstCodigosPostales(this.formRegistro.get('codigoPostal')?.value).subscribe({
      next: (elemento) => {
        this.formRegistro.get('pais')?.setValue(103)
        this.formRegistro.get('estado')?.setValue(elemento.respuesta.estado.idEstado);
        this.formRegistro.get('municipio')?.setValue(elemento.respuesta.delegacionMunicipio.idMunicipio);
        this.colonias = mapearArregloTipoDropdown(elemento.respuesta.colonias, 'nomColonia', 'idColonia');
      }
    })
  }

  obtenerEstadoPorPais(pais: number): void {
    if (!pais) return;
    this.municipios = [];
    this.colonias = [];
    this._CatalogoGenService.getLstEstadosByPais(pais).subscribe({
      next: (valor) => {
        this.estados = mapearArregloTipoDropdown(valor.respuesta, 'desEstado', 'idEstado');
      }
    });
  }

  obtenerMunicipioPorEstado(estado: number): void {
    if (!estado) return;
    this._CatalogoGenService.getLstDelegacionesMunicipiosByEstado(estado).subscribe({
      next: (valor) => {
        this.municipios = mapearArregloTipoDropdown(valor.respuesta, 'desMunicipio', 'idMunicipio');
      }
    });
  }

  obtenerZonasPorMunicipio(municipio: number): void {
    if (!municipio) return;
    this._CatalogoGenService.getLstZonas(municipio).subscribe({
      next: (valor) => {
        this.zonas = mapearArregloTipoDropdown(valor.respuesta, 'desZona', 'cveZona');
      },
      error: ()=> {
        this.zonas = [];
        console.log('Ocurrio un error con la búsqueda de zonas');
      }
    });
  }

  asignarFormularioZonaInteres(): FormGroup {
    return this.fb.group({
      ooad: [{value: '', disabled: false}, [Validators.required]],
      zonaInteres: [{value: '', disabled: false}, [Validators.required]]
    })
  }

  asignarFormularioDocumentosEspecialidad(): FormGroup {
    return this.fb.group({
      especialidad: [{value: '', disabled: false}, [Validators.required]],
      documento: [{value: '', disabled: false}, [Validators.required]]
    })
  }

  agregarZonaInteres(): void {
    if (this.zonasInteres().length > 2) {
      this._alertServices.alerta("Recuerda que solo puedes seleccionar hasta tres zonas de interés.");
      this.formZonaInteres.reset();
      return;
    }

    const nuevaZona = this.crearRegistroZonaInteres();

    // zE => zona Existente
    const esDuplicado = this.zonasInteres().some((zE: any) => zE.ooad === nuevaZona.ooad && zE.zonaInteres === nuevaZona.zonaInteres);

    if (esDuplicado) {
      this._alertServices.alerta("Ya seleccionaste esta opción anteriormente");
    } else {
      this.zonasInteres.update(value => [...value, nuevaZona]);
      this.zonas = [];
    }

    this.formZonaInteres.reset();
  }

  devolverTextoOoad(idOOAD: string): string {

    this.zonasInteres();
    const ooad = this.ooad.find(element => idOOAD == element.value);
    return ooad?.label || "";
  }

  devolverTextoZonaInnteres(idZona: string): string {
    const zona = this.zonas.find(element => idZona == element.value);
    return zona?.label || "";
  }

  obtenerCatalogos(): void {
    this.activatedRoute.data.subscribe(({respuesta}) => {

      const [sexos, estadosCiviles, paises, lugaresNacimiento, tiposDocumentos, ooad, especialidades, dias] = respuesta;
      this.sexos = mapearArregloTipoDropdown(sexos.respuesta, 'desSexo', 'idSexo');
      this.estadosCiviles = mapearArregloTipoDropdown(estadosCiviles.respuesta, 'desEstadoCivil', 'idEstadoCivil');
      this.paises = mapearArregloTipoDropdown(paises.respuesta, 'desPais', 'idPais');
      this.lugaresNacimiento = mapearArregloTipoDropdown(lugaresNacimiento.respuesta, 'desLugarNacimiento', 'idLugarNacimiento');
      this.lstTiposDocumentos = mapearArregloTipoDropdown(tiposDocumentos.respuesta, 'desTipoDocumentoEspecialidad', 'idTipoDocumentoEspecialidad');
      this.ooad = mapearArregloTipoDropdown(ooad.respuesta, 'desOoad', 'cveOoad');
      this.especialidades = mapearArregloTipoDropdown(especialidades, 'desEspecialidad', 'cveEspecialidad');
      this.dias_semana = mapearArregloTipoDropdown(dias.respuesta, 'descDiaSemana', 'idDiaSemana')
    });
  }

  crearRegistroZonaInteres() {
    return {
      "ooad": this.formZonaInteres.get('ooad')?.value,
      "zonaInteres": this.formZonaInteres.get('zonaInteres')?.value,
      "desZona": this.devolverTextoZonaInnteres(this.formZonaInteres.get('zonaInteres')?.value),
      "desOoad": this.devolverTextoOoad(this.formZonaInteres.get('ooad')?.value)
    }
  }

  eliminarZonaInteres(indice: number): void {
    const zonasActualizadas = [...this.zonasInteres().slice(0, indice),
      ...this.zonasInteres().slice(indice + 1)];
    this.zonasInteres.update(() => zonasActualizadas);
  }

  obtenerNuevoDocumento(guid: string = ''): TabDocumento {
    const tipoDocumento = this.formDocumentosEspecialidad.get('documento')?.value;
    const documentoLabel = this.lstTiposDocumentos.find(d => d.value === tipoDocumento)?.label as string;
    const especialidad = this.formDocumentosEspecialidad.get('especialidad')?.value;
    const especialidadLabel = this.especialidades.find(d => d.value === especialidad)?.label as string;

    return {
      tipoDocumento: documentoLabel,
      especialidadMedica: especialidadLabel,
      cveEspecialidad: especialidad,
      idDocumento: tipoDocumento,
      guid
    }
  }

  subirDocumentoyObtenerGuid(): void {
    const tipoDoc = this.obtenerTipoDocumentoAValidar();
    const especialidadDoc = this.obtenerEspecialidadAValidar();

    if (this.yaExistenEspecilidadesPermitidas(especialidadDoc)) {

      this._alertServices.alerta(`El limite de especialidades ha sido alcanzado`);
      this.limpiarDocumentoEspecialidad()
      return;
    }

    if (this.documentoYaExisteParaEspecialidad(tipoDoc, especialidadDoc)) {
      this._alertServices.alerta(`El documento de tipo ${tipoDoc} ya fue cargado para la especialidad ${especialidadDoc}.`);
      this.limpiarDocumentoEspecialidad();
      return;
    }

    if (!this.documentoEspecialidad) return;

    const formData = new FormData();
    formData.append('file', this.documentoEspecialidad, this.documentoEspecialidad.name);
    this.guardarArchivo(formData, 'especialidad');
  }

  obtenerTipoDocumentoAValidar(): string {
    return this.obtenerNuevoDocumento()?.tipoDocumento;
  }

  obtenerEspecialidadAValidar(): string {
    return this.obtenerNuevoDocumento()?.especialidadMedica;
  }

  documentoYaExisteParaEspecialidad(tipoDocumento: string, especialidad: string): boolean {
    const especialidades = this.registrosDocumentosEspecialidad();
    const especialidadExistente = especialidades.find(e => e.especialidad === especialidad);
    if (!especialidadExistente) {
      return false;
    }
    return especialidadExistente.documentos.some(doc => doc.tipoDocumento === tipoDocumento);
  }

  yaExistenEspecilidadesPermitidas(especialidad: string): boolean {
    const especialidades = this.registrosDocumentosEspecialidad();
    const especialidadExistente = especialidades.find(e => e.especialidad === especialidad);
    return !especialidadExistente && this.registrosDocumentosEspecialidad().length === 3;
  }

  agregarDocumento(guid: string): void {
    const nuevoDocumento = this.obtenerNuevoDocumento(guid);
    if (!nuevoDocumento) return;
    const especialidades = this.registrosDocumentosEspecialidad();
    const indiceEspecialidad = especialidades.findIndex(e => e.especialidad === nuevoDocumento.especialidadMedica);

    // Si la especialidad no existe, la creamos
    if (indiceEspecialidad === -1) {
      const nuevaEspecialidad: TabNode = {
        especialidad: nuevoDocumento.especialidadMedica,
        documentos: [nuevoDocumento]
      };
      const especialidadesActualizadas: TabNode[] = [...this.registrosDocumentosEspecialidad(), nuevaEspecialidad];
      this.registrosDocumentosEspecialidad.update(value => especialidadesActualizadas);
      this.documentosLocalStorageService.guardarRefGuidEspecialidad(especialidadesActualizadas);
      this.limpiarDocumentoEspecialidad();
      return;
    }

    // Si la especialidad ya existe, verificamos si el documento es un duplicado
    const especialidadExistente = {...especialidades[indiceEspecialidad]};
    const documentoYaExiste = especialidadExistente.documentos.some(doc => doc.tipoDocumento === nuevoDocumento.tipoDocumento);

    if (documentoYaExiste) {
      console.warn('El documento ya existe para esta especialidad. No se ha añadido.');
      return; // No hacemos nada si es un duplicado
    }

    // Añadimos el nuevo documento y actualizamos el signal
    especialidadExistente.documentos.push(nuevoDocumento);
    this.limpiarDocumentoEspecialidad();

    const especialidadesActualizadas = [...especialidades.slice(0, indiceEspecialidad),
      especialidadExistente,
      ...especialidades.slice(indiceEspecialidad + 1)
    ];
    this.documentosLocalStorageService.guardarRefGuidEspecialidad(especialidadesActualizadas);
    this.registrosDocumentosEspecialidad.update(() => especialidadesActualizadas);
  }

  limpiarDocumentoEspecialidad(): void {
    this.formDocumentosEspecialidad.reset();
    this.documentoEspecialidad = null;
    const uploader = this.uploaders.find(comp => comp.idArchivo === 'especialidad');
    if (uploader) {
      uploader.clear();
    }
  }

  eliminarDocumento(especialidadMedica: string, tipoDocumento: string): void {
    const especialidades = this.registrosDocumentosEspecialidad();
    const indiceEspecialidad = especialidades.findIndex(e => e.especialidad === especialidadMedica);

    if (indiceEspecialidad === -1) {
      console.error('La especialidad no se encontró, no se puede eliminar el documento.');
      return;
    }

    const especialidadParaModificar = {...especialidades[indiceEspecialidad]};

    const idDocumentoEspecialidad = especialidadParaModificar.documentos.find(d => d.tipoDocumento === tipoDocumento)?.idDocumentoEspecialidad;

    if (idDocumentoEspecialidad) {
      this.especialidadesPorEliminar.push(idDocumentoEspecialidad);
    }

    const documentosActualizados = especialidadParaModificar.documentos.filter(d => d.tipoDocumento !== tipoDocumento);

    // Si la lista de documentos queda vacía, eliminamos la especialidad completa
    if (documentosActualizados.length === 0) {
      const especialidadesSinEspecialidad = [...especialidades.slice(0, indiceEspecialidad),
        ...especialidades.slice(indiceEspecialidad + 1)
      ];
      this.registrosDocumentosEspecialidad.update(() => especialidadesSinEspecialidad);
      this.documentosLocalStorageService.guardarRefGuidEspecialidad(especialidadesSinEspecialidad);
    } else {
      // Si aún hay documentos, actualizamos la especialidad con la nueva lista
      especialidadParaModificar.documentos = documentosActualizados;
      const especialidadesModificadas = [...especialidades.slice(0, indiceEspecialidad),
        especialidadParaModificar,
        ...especialidades.slice(indiceEspecialidad + 1)
      ];
      this.registrosDocumentosEspecialidad.update(() => especialidadesModificadas);
      this.documentosLocalStorageService.guardarRefGuidEspecialidad(especialidadesModificadas);
    }
  }

  obtenerDatosGenerales(idusuario: number | undefined): void {
    if (!idusuario) return;
    this._ConvocatoriaService.getDatosGenerales(idusuario).subscribe({
      next: (response: dataGenerales) => {
        if (!response.exito) return;
        this.datosGenerales = response.respuesta;
        this.setDatosGenerales();
      }
    });
  }

  obtenerDatosFoto(idusuario: number | undefined): void {
    if (!idusuario) return;
    this._ConvocatoriaService.getDatosFotografia(idusuario).subscribe({
      next: (response: DataFotografia) => {
        if (!response.exito) return;
        this.datosFoto = response.respuesta.fotografia;
        this.obtenerFotografia()
      }
    });
  }

  obtenerFotografia(): void {
    if (!this.datosFoto) return;
    this.saveSession('datosFoto', this.datosFoto.documento);
    this.documentoService.getFotografia(this.datosFoto.documento.refGuid).pipe(
    ).subscribe({
      next: (response: any) => {
        this.blnFotoGuardada = true;
        this.selectFile = response;
        const nombreArchivo = 'foto_perfil.png';
        const tipoArchivo = response.type;
        this.defaultFile = new File([response], nombreArchivo, {type: tipoArchivo});
      }
    });
  }

  private setDatosGenerales(): void {

    const {
      datosContacto,
      datosPersonales,
      datosResidenciaActual,
      dependientes,
      zonasInteresLaboral
    } = this.datosGenerales;

    if (datosContacto) {
      const {refEmail, refCorreoAdicional, refTelefonoCasa, refTelefonoCelular} = datosContacto;
      this.formRegistro.controls['correo'].setValue(refEmail || null);
      this.formRegistro.controls['correoAdicional'].setValue(refCorreoAdicional || null);
      this.formRegistro.controls['telefonoCasa'].setValue(refTelefonoCasa || null);
      this.formRegistro.controls['telefonoCelular'].setValue(refTelefonoCelular || null);
    }

    if (datosPersonales) {

      const {
        refRfc,
        refNss,
        estadoCivil,
        paisNacimiento,
        lugarNacimiento,
        perfil,
        sexo,
        fecNacimiento
      } = datosPersonales;

      if (perfil.idPerfil == 2) {
        this.formRegistro.controls['nss'].setValidators([Validators.required]);
        this.formRegistro.controls['nss'].updateValueAndValidity();
      }

      this.formRegistro.controls['rfc'].setValue(refRfc || null);
      this.formRegistro.controls['nss'].setValue(refNss || null);

      if (estadoCivil) {
        this.formRegistro.get('estadoCivil')?.patchValue(estadoCivil.idEstadoCivil);
      }

      if (paisNacimiento) {
        this.formRegistro.get('paisNacimiento')?.patchValue({
          label: paisNacimiento.desPais,
          value: paisNacimiento.idPais
        });
      }

      if (lugarNacimiento) {
        this.formRegistro.get('estadoNacimiento')?.patchValue(lugarNacimiento.idLugarNacimiento);
      }

      /* CUANDO NO EXISTE CURP DEJA DE FUNCIONAR LA OBTENCION POR CURP */
      if (perfil.idPerfil == 3) {
        if (sexo) {
          this.formRegistro.get('sexo')?.patchValue(
            {
              label: sexo.desSexo,
              value: sexo.idSexo
            }
          )
        } else {
          this.formRegistro.get('sexo')?.enable();
        }

        if (fecNacimiento) {
          var fecha = this.obtenerFechaDesdeCadena(fecNacimiento);
          this.formRegistro.get('fechaNacimiento')?.setValue(fecha || null);
        } else {
          this.formRegistro.get('fechaNacimiento')?.enable();
        }
      }
    }

    if (datosResidenciaActual) {
      const {colonia, pais, estado, delegacion, nomCalle, refNumero} = datosResidenciaActual;


      this.formRegistro.controls['codigoPostal'].setValue(colonia?.refCodigoPostal.toString().padStart(5, '0') || null);
      this.validarCP();

      // PatchValue para IDs de catálogos de domicilio
      this.formRegistro.get('pais')?.patchValue(pais?.idPais || null);
      this.formRegistro.get('estado')?.patchValue(estado?.idEstado || null);
      this.formRegistro.get('municipio')?.patchValue(delegacion?.idMunicipio || null);
      this.formRegistro.get('colonia')?.patchValue(colonia?.idColonia || null);

      this.formRegistro.controls['calle'].setValue(nomCalle || null);
      this.formRegistro.controls['numeroExterior'].setValue(refNumero || null);
    }

    if (dependientes) {

      const {indPadres, refCantidadHijos, indConyuge, refOtro, indNinguno} = dependientes;
      if (indPadres == 1) {
        this.formRegistro.get("indPadres")?.setValue(true);
      }

      if (refCantidadHijos) {
        this.formRegistro.get("hijos")?.setValue(refCantidadHijos);
        this.formRegistro.get("indHijos")?.setValue(true);
      }

      if (indConyuge == 1) {
        this.formRegistro.get("indConyuge")?.setValue(true);
      }

      if (refOtro != null) {
        this.formRegistro.get("otros")?.setValue(refOtro);
        this.formRegistro.get("indOtros")?.setValue(true);
      }
      if(indNinguno == 1){
        this.formRegistro.get("indNinguno")?.setValue(true);
      }

      this.subscribirseACambioComponentes();
      //this.formRegistro.get('hijos')?.setValue(refCantidadHijos);
      //this.formRegistro.get('otros')?.setValue(refOtro);
    }

    if (zonasInteresLaboral?.length) {
      const zonasInteresMapeadas = zonasInteresLaboral.map((zona: any) => ({
        idInteresOoadZona: zona.idInteresOoadZona,
        cveOoad: zona.cveOoad,
        desOoad: zona.desOoad,
        cveZona: zona.cveZona,
        desZona: zona.desZona,
        // Mapeo directo a las propiedades usadas por la lógica de la UI
        ooad: zona.cveOoad,
        zonaInteres: zona.cveZona
      }));
      // Usamos .set para establecer el valor de la Signal
      this.zonasInteres.set(zonasInteresMapeadas);
    }
  }

  private saveContacto(): DatosContacto {
    const paisNacimientoSeleccionado: TipoDropdown = this.formRegistro.get('paisNacimiento')?.value;

    let contacto = {...this.datosGenerales.datosContacto}
    contacto.refCorreoAdicional = this.formRegistro.controls['correoAdicional'].value;
    contacto.refTelefonoCasa = this.formRegistro.controls['telefonoCasa'].value;
    contacto.refTelefonoCelular = this.formRegistro.controls['telefonoCelular'].value;

    const pais: Pais = {
      nomPaisNacimiento: paisNacimientoSeleccionado.label,
      idPais: paisNacimientoSeleccionado.value as number,
      cvePais: '',
      desPais: ''
    }
    contacto.paisNacimiento = pais;

    const estadoNacimientoSeleccionado: number = this.formRegistro.get('estadoNacimiento')?.value;
    const estado: Estado = {
      idLugarNacimiento: estadoNacimientoSeleccionado,
      idEstado: 0,
      desEstado: ''
    }
    contacto.lugarNacimiento = estado;
    return contacto;
  }

  private saveDomicilio(): Residencia {
    let residencia = new Residencia();
    let idColonia = this.formRegistro.controls['colonia'].value;
    residencia.colonia = this.obtenerColonia(idColonia);
    residencia.nomCalle = this.formRegistro.controls['calle'].value;
    residencia.refNumero = this.formRegistro.controls['numeroExterior'].value;
    return residencia;
  }

  private saveDependientes(): Dependientes {
    /* let dependientes = new Dependientes();
    let d = this.formRegistro.controls['dependientes'].value;
    dependientes.indConyuge = d.key == 'P' ? 1 : 0;
    dependientes.indPadres = d.key == 'A' ? 1 : 0;
    dependientes.refCantidadHijos = this.formRegistro.controls['hijos'].value;
    dependientes.refOtro = this.formRegistro.controls['otros'].value;
    return dependientes; */


    let dependientes = new Dependientes();
    dependientes.indPadres = this.formRegistro.get("indPadres")?.value ? 1 : 0;
    dependientes.indConyuge = this.formRegistro.get("indConyuge")?.value ? 1 : 0;
    dependientes.refCantidadHijos = this.formRegistro.get("indHijos")?.value ? this.formRegistro.get("hijos")?.value : null;
    dependientes.refOtro = this.formRegistro.get("indOtros")?.value ? this.formRegistro.get("otros")?.value : null;
    dependientes.indNinguno = this.formRegistro.get("indNinguno")?.value ? 1 : 0;
    return dependientes;

  }

  private saveDatosGenerales() {

    if (this.zonasInteres().length == 0) {
      this._alertServices.alerta("Debes agregar al menos una zona de interés")
      return;
    }

    let datos = new DatosGeneralesRequest();
    datos.datosContacto = this.saveContacto();
    datos.datosResidenciaActual = this.saveDomicilio();
    datos.datosPersonales = this.saveFoto();
    datos.dependientes = this.saveDependientes();

    datos.zonasInteresLaboral = this.zonasInteres().map((reg: InteresLaboral) => ({
      cveOoad: reg.ooad + '',
      desOoad: reg.desOoad + '',
      desZona: reg.desZona + '',
      cveZona: reg.zonaInteres + ''
    }));

    this._ConvocatoriaService.guardarDatosGenerales(datos).subscribe({
      next: (data: ResponseGeneral) => {
        if (data.exito) {
          this.indice.update((value: number) => value + 1);
          return this._alertServices.exito(data.mensaje)
        }
        return this._alertServices.error(data.mensaje)
      },
      error: (err: ResponseGeneral) => {
        this._alertServices.error(err.mensaje);
      }
    });
  }

  private saveFotoFile(datos: FormData, archivo: File): void {
    this.blnFotoGuardada = false;

    const idUsuario = this.datosGenerales?.datosPersonales?.idUsuario;

    if (!idUsuario) {
      this._alertServices.error('No se pudo obtener el ID de usuario.');
      return;
    }

    // Guardar el archivo (Guardar GUID)
    this.documentoService.guardarFoto(datos, 1, idUsuario).pipe(
      // Manejo de error para la primera llamada y preparación para la segunda
      switchMap((data: any) => {
        if (!data?.guid) {
          // Si la primera llamada falla o no devuelve GUID, lanzamos un error para detener el flujo.
          return throwError(() => new Error(data?.mensaje || 'Error al obtener GUID de la foto.'));
        }

        // Estructura de datos simplificada para la segunda llamada
        const datosF = {
          datosPersonales: {idUsuario: idUsuario},
          fotografia: {
            documento: {refGuid: data.guid}
          }
        };

        // Se Guarda la referencia de la foto en la Convocatoria
        return this._ConvocatoriaService.guardarFoto(datosF);
      }),

      // Manejo de errores para toda la cadena
      catchError((error) => {
        // Capturamos cualquier error lanzado en switchMap o errores HTTP
        this.blnFotoGuardada = false;
        this._alertServices.error(error.error || 'Error en el proceso de guardado de la foto.');
        return of(null); // Devolvemos un observable nulo para completar el flujo sin error.
      })
    ).subscribe({
      // Se ejecuta solo si el pipe se completó sin lanzar un error fatal
      next: (data: ResponseGeneral | null) => {
        // Verificamos si el flujo se detuvo por catchError (que devuelve null)
        if (data?.exito) {
          this.blnFotoGuardada = true;
          this._alertServices.exito(data.mensaje);
          this.defaultFile = archivo;
        } else if (data && !data.exito) {
          this.blnFotoGuardada = false;
          this._alertServices.error(data.mensaje);
        } else {
          this.needsCleanup = true;
        }
      }
    });
  }

  private obtenerColonia(idColonia: number): Colonia {
    let colonia = this.colonias.find(x => x.value == idColonia);
    return {
      idColonia: Number.parseInt(colonia?.value + ''),
      nomColonia: colonia?.label + '',
      refCodigoPostal: '' + this.formRegistro.controls['codigoPostal'].value
    }
  }

  private saveFoto(): DatosPersonales {


    const estadoCivilSeleccionado: string = this.formRegistro.get('estadoCivil')?.value;
    let fotografia: FotografiaRequest = new FotografiaRequest();
    fotografia.datosPersonales = this.datosGenerales.datosPersonales;
    fotografia.datosPersonales.estadoCivil = new EstadoCivil();
    fotografia.datosPersonales.estadoCivil.idEstadoCivil = Number.parseInt(estadoCivilSeleccionado);
    let fechaEntrada = this.formRegistro.controls['fechaNacimiento'].value;

    let fechaFormateada: string = dayjs.utc(fechaEntrada).local().format('DD/MM/YYYY')
    fotografia.datosPersonales.refRfc = this.formRegistro.controls['rfc'].value;
    fotografia.datosPersonales.refNss = this.formRegistro.controls['nss'].value;
    fotografia.datosPersonales.fecNacimiento = fechaFormateada;
    let sexo = this.formRegistro.controls['sexo'].value;
    fotografia.datosPersonales.sexo = {
      idSexo: sexo.value,
    };
    return fotografia.datosPersonales;
  }

  onFileSelected($event: any): void {
    if ($event.length == 0) {
      this._alertServices.alerta('El peso del archivo excede al permitido.');
      return;
    }
    const files: FileList | File[] = $event?.target?.files || $event;
    const archivo: File | undefined = files?.[0];
    if (!archivo) {
      return;
    }

    const formData = new FormData();
    formData.append('file', archivo, archivo.name);
    this.saveFotoFile(formData, archivo);
  }

  private btnGuardar(paso: number): void {
    if (paso === 0) {
      if (!this.blnFotoGuardada && !this.selectFile) {
        this._alertServices.alerta('La foto no ha sido cargada, selecciona otro archivo.');
        return;
      }

      this.saveDatosGenerales();

    }
  }

  onCleanupDone(): void {
    // lo que disparará ngOnChanges de nuevo.
    this.needsCleanup = false;
  }

  validacionesNegocio() {

    if (this.userData?.idPerfil == 3) {
      this.formRegistro.get('nss')?.clearValidators;
      this.formRegistro.get('nss')?.updateValueAndValidity;
    }
  }

  siguientePasoStepper(): void {

    const currentStep = this.indice();
    const action = this.pasoActions[currentStep];

    // Ejecutar la acción si existe para el índice actual
    if (action) {
      action();
    }
  }

  private readonly pasoActions: { [key: number]: () => void } = {
    0: () => {
      if (this.formRegistro.invalid) {
        this._alertServices.alerta(this._Mensajes.MSG023);
        this.formRegistro.markAllAsTouched();
        return;
      }
      this.btnGuardar(0);
    },
    1: () => {
      if (this.formDocumentosEspecialidad.invalid) {
        this._alertServices.alerta(this._Mensajes.MSG023);
        return;
      }
      this.btnGuardar(1);
    }
  };

  procesarArchivoObligatorio($event: any, id: number): void {
    const files: FileList | File[] = $event?.target?.files || $event;
    const archivo: File | undefined = files?.[0];
    if (!archivo) {
      return;
    }

    const formData = new FormData();
    formData.append('file', archivo, archivo.name);
    this.guardarArchivo(formData, 'obligatorio', id);
  }

  procesarArchivoEspecializacion($event: any): void {
    const files: FileList | File[] = $event?.target?.files || $event;
    const archivo: File | undefined = files?.[0];
    if (!archivo) {
      return;
    }
    this.documentoEspecialidad = archivo;
  }


  private guardarArchivo(datos: FormData, tipo: 'constancia' | 'obligatorio' | 'especialidad', id: number = 0): void {

    const idUsuario = this.datosGenerales?.datosPersonales?.idUsuario;

    if (!idUsuario) {
      this._alertServices.error('No se pudo obtener el ID de usuario.');
      return;
    }

    datos.append('idModulo', '1')
    datos.append('idUsuario', idUsuario.toString())

    // Guardar el archivo (Guardar GUID)
    this.documentoService.guardarDocumento(datos).subscribe({
      next: (data: any) => {
        if (!data?.guid) {
          this._alertServices.error(data?.mensaje || 'Error al obtener GUID del documento.');
          return;
        }
        if (tipo === 'obligatorio') {
          this.documentosLocalStorageService.guardarRefGuidObligatorio(id, data.guid);
        }
        if (tipo === 'especialidad') {
          this.agregarDocumento(data.guid);
        }
        if (tipo === 'constancia') {
          this.guardarRefGuidConstancia(id, data.guid);
        }
      }
    });
  }

  guardarRefGuidConstancia(id: number, guid: string): void {
    let nombre = '';
    if (id === 1) nombre = this.nombreConstancia1;
    if (id === 2) nombre = this.nombreConstancia2;
    if (id === 3) nombre = this.nombreConstancia3;
    this.documentosLocalStorageService.guardarRefGuidConstancia(id, guid, nombre)
  }

  revisarDocumentosLocalHost(): void {

    const refObligatorio1 = this.documentosLocalStorageService.obtenerRefGuid(1);
    const refObligatorio2 = this.documentosLocalStorageService.obtenerRefGuid(2);
    const refObligatorio3 = this.documentosLocalStorageService.obtenerRefGuid(3);
    const especialidades = this.documentosLocalStorageService.obtenerRefGuidEspecialidad();
    const refConstancia1 = this.documentosLocalStorageService.obtenerRefConstancia(1);
    const refConstancia2 = this.documentosLocalStorageService.obtenerRefConstancia(2);
    const refConstancia3 = this.documentosLocalStorageService.obtenerRefConstancia(3);
    if (refObligatorio1) {
      this.obtenerDocumento(refObligatorio1, 'obligatorio', 1);
    }
    if (refObligatorio2) {
      this.obtenerDocumento(refObligatorio2, 'obligatorio', 2);
    }
    if (refObligatorio3) {
      this.obtenerDocumento(refObligatorio3, 'obligatorio', 3);
    }
    this.registrosDocumentosEspecialidad.update(valor => especialidades);

    if (refConstancia1) {
      this.obtenerDocumento(refConstancia1.refGuid, 'constancia', 1, refConstancia1.nombre);
    }
    if (refConstancia2) {
      this.obtenerDocumento(refConstancia2.refGuid, 'constancia', 2, refConstancia2.nombre);
    }
    if (refConstancia3) {
      this.obtenerDocumento(refConstancia3.refGuid, 'constancia', 3, refConstancia3.nombre);
    }
  }

  obtenerDocumento(refGuid: string, tipo: string, id: number, nombre: string = ''): void {
    this.documentoService.obtenerDocumento(refGuid).subscribe({
      next: (response: any) => {

        const tipoArchivo = response.type;
        if (tipo === 'obligatorio' && id === 1) {

          const nombreArchivo = 'identificacion_oficial';
          this.archivoINE = new File([response], nombreArchivo, {type: tipoArchivo});
          this.documentosLocalStorageService.guardarRefGuidObligatorio(id, refGuid);
        }
        if (tipo === 'obligatorio' && id === 2) {
          const nombreArchivo = 'titulo';
          this.archivoTitulo = new File([response], nombreArchivo, {type: tipoArchivo});
          this.documentosLocalStorageService.guardarRefGuidObligatorio(id, refGuid);
        }
        if (tipo === 'obligatorio' && id === 3) {
          const nombreArchivo = 'cedula_profesional';
          this.archivoCedula = new File([response], nombreArchivo, {type: tipoArchivo});
          this.documentosLocalStorageService.guardarRefGuidObligatorio(id, refGuid);
        }
        if (tipo === 'constancia' && id === 1) {
          this.nombreConstancia1 = nombre;
          this.archivoConstancia1 = new File([response], nombre, {type: tipoArchivo});
          this.documentosLocalStorageService.guardarRefGuidConstancia(id, refGuid, nombre)
        }
        if (tipo === 'constancia' && id === 2) {
          this.nombreConstancia2 = nombre;
          this.archivoConstancia2 = new File([response], nombre, {type: tipoArchivo});
          this.documentosLocalStorageService.guardarRefGuidConstancia(id, refGuid, nombre)
        }
        if (tipo === 'constancia' && id === 3) {
          this.nombreConstancia3 = nombre;
          this.archivoConstancia3 = new File([response], nombre, {type: tipoArchivo});
          this.documentosLocalStorageService.guardarRefGuidConstancia(id, refGuid, nombre)
        }
      }
    });
  }

  procesarConstancia($event: any, id: number): void {
    const files: FileList | File[] = $event?.target?.files || $event;
    const archivo: File | undefined = files?.[0];
    if (!archivo) {
      return;
    }


    const formData = new FormData();
    formData.append('file', archivo, archivo.name);
    this.guardarArchivo(formData, 'constancia', id);
  }

  actualizarNombreDocumento(id: number, event: any): void {
    const refConstancia = this.documentosLocalStorageService.obtenerRefConstancia(id);
    const nombre = event.target.value;
    if (!refConstancia.refGuid) return;
    this.documentosLocalStorageService.guardarRefGuidConstancia(id, refConstancia.refGuid, nombre)
  }

  guardarDocumentacion(finalizarRegistro: boolean = false): void {

    const refObligatorio1 = this.documentosLocalStorageService.obtenerRefGuid(1);
    const refObligatorio2 = this.documentosLocalStorageService.obtenerRefGuid(2);
    const refObligatorio3 = this.documentosLocalStorageService.obtenerRefGuid(3);
    const especialidades = this.documentosLocalStorageService.obtenerRefGuidEspecialidad();
    const externo = this.userData?.idPerfil === 3;

    if (this.estatusPendienteDocumentacion) {
      this.indice.update((value: number) => value + 1);
      return;
    }

    if (!refObligatorio1) {
      this._alertServices.error(this._Mensajes.MSG037);
      return;
    }
    if (!refObligatorio2) {
      this._alertServices.error(this._Mensajes.MSG037);
      return;
    }
    if (!refObligatorio3) {
      this._alertServices.error(this._Mensajes.MSG037);
      return;
    }
    if (especialidades.length === 0) {
      this._alertServices.error(this._Mensajes.MSG037);
      this._alertServices.error('Al menos debe estar cargada una especialidad');
      return;
    }
    const cadaEspecialidadTieneDiploma: boolean = especialidades.every(node =>
      node.documentos.some(documento => documento.idDocumento === 1));
    if (!cadaEspecialidadTieneDiploma && !externo) {
      this._alertServices.error(this._Mensajes.MSG037);
      this._alertServices.error('Para cada especialidad es necesario el documento Diploma Institucional de Especialidad');
      return;
    }
    if (this.formDatosEmpleo.invalid && externo) {
      this._alertServices.error(this._Mensajes.MSG025);
      return;
    }

    this.limpiarDocumentoEspecialidad();

    const solicitud: SolicitudGuardarDocumentacion = this.generarSolicitudGuardarDocumentacion();
    if (finalizarRegistro) {
      this.finalizarRegistro(solicitud);
    } else {
      this.guardarSegundaSeccion(solicitud);
    }

  }

  finalizarRegistro(solicitud: SolicitudGuardarDocumentacion): void {
    this._ConvocatoriaService.terminarRegistro(solicitud).subscribe({
      next: (data: ResponseGeneral) => {
        if (data.exito) {
          // this.indice.update((value: number) => value + 1);
          this._alertServices.exito(this._Mensajes.MSG039)
          this.estatusPendienteDocumentacion = true;
          this.especialidadesPorEliminar = [];
          this.constanciasPorEliminar = [];
          this.documentosLocalStorageService.limpiar();
          this.desactivarForms();
          this.recargarInfo();
          return;
        }
        this._alertServices.error(data.mensaje)
      },
      error: (err: ResponseGeneral) => {
        this._alertServices.error(err.mensaje);
      }
    });
  }

  guardarSegundaSeccion(solicitud: SolicitudGuardarDocumentacion): void {
    this._ConvocatoriaService.guardarDatosDocumentosEscolares(solicitud).subscribe({
      next: (data: ResponseGeneral) => {
        if (data.exito) {
          // this.indice.update((value: number) => value + 1);
          this.especialidadesPorEliminar = [];
          this.constanciasPorEliminar = [];
          this._alertServices.exito(this._Mensajes.MSG026);
          this.recargarInfo();
          return;
        }
        this._alertServices.error(data.mensaje)
      },
      error: (err: ResponseGeneral) => {
        this._alertServices.error(err.mensaje);
      }
    });
  }

  generarSolicitudGuardarDocumentacion(): SolicitudGuardarDocumentacion {
    const externo = this.userData?.idPerfil === 3;
    const constancias = this.documentosLocalStorageService.obtenerRefConstanciaCompleta();

    if (!externo) {
      return {
        datosPersonales: {
          idUsuario: this.userData?.idUsuario as number
        },
        documentosObligatorios: this.generarDocumentosObligatorios(),
        especialidadesDocumentos: this.generarDocumentosEspecialidad(),
        documentosEspecialidadesEliminar: this.especialidadesPorEliminar,
      }
    }
    return {
      datosPersonales: {
        idUsuario: this.userData?.idUsuario as number
      },
      documentosObligatorios: this.generarDocumentosObligatorios(),
      especialidadesDocumentos: this.generarDocumentosEspecialidad(),
      documentosConstancias: this.transformarDocumentosConstancia(constancias),
      datosEmpleo: this.transformarFormularioADatosEmpleo(),
      documentosEspecialidadesEliminar: this.especialidadesPorEliminar,
      documentosConstanciasEliminar: this.constanciasPorEliminar
    }
  }

  generarDocumentosObligatorios(): SolicitudDocumentoObligatorio[] {
    const refObligatorio1 = this.documentosLocalStorageService.obtenerRefGuid(1);
    const refObligatorio2 = this.documentosLocalStorageService.obtenerRefGuid(2);
    const refObligatorio3 = this.documentosLocalStorageService.obtenerRefGuid(3);
    const registros: SolicitudDocumentoObligatorio[] = [
      {
        idDocumentoObligatorio: this.idDocumentoINE,
        tipoDocumentoObligatorio: {
          idDocumentoObligatorio: 1
        },
        documento: {
          refGuid: refObligatorio1
        }
      },
      {
        idDocumentoObligatorio: this.idDocumentoTitulo,
        tipoDocumentoObligatorio: {
          idDocumentoObligatorio: 2,
          desDocumentoObligatorio: "TITULO"
        },
        documento: {
          refGuid: refObligatorio2
        }
      },
      {
        idDocumentoObligatorio: this.idDocumentoCedula,
        tipoDocumentoObligatorio: {
          idDocumentoObligatorio: 3,
          desDocumentoObligatorio: "CEDULA PROFESIONAL"
        },
        documento: {
          refGuid: refObligatorio3
        }
      }
    ]
    return registros.map((r: SolicitudDocumentoObligatorio) => {
      if (!r.idDocumentoObligatorio) delete r.idDocumentoObligatorio
      return r
    })
  }

  generarDocumentosEspecialidad(): DocumentoEspecialidad[] {
    return this.registrosDocumentosEspecialidad().map(node => {
      const cveEspecialidad = node.documentos.length > 0 ? node.documentos[0].cveEspecialidad : '';

      // Mapear el array de documentos a la estructura RefDocumentoEspecialidad
      const documentosEspecialidad: RefDocumentoEspecialidad[] = node.documentos.map(doc => {
        return {
          idDocumentoEspecialidad: doc.idDocumentoEspecialidad,
          tipoDocumentoEspecialidad: {
            idTipoDocumentoEspecialidad: doc.idDocumento,
          },
          documento: {
            refGuid: doc.guid,
          }
        };
      });

      const documentosCompletos = documentosEspecialidad.map(d => {
        if (!d.idDocumentoEspecialidad) delete d.idDocumentoEspecialidad
        return d;
      })

      // Construir el objeto DocumentoEspecialidad final
      return {
        cveEspecialidad: cveEspecialidad,
        desEspecialidad: node.especialidad, // La descripción es el nombre de la especialidad
        documentosEspecialidad: documentosCompletos
      };
    });
  }

  transformarFormularioADatosEmpleo(): DatosEmpleo {
    const formValues = this.formDatosEmpleo.getRawValue();

    const indOtroEmpleo = (formValues.otroEmpleo === '1' ? 1 : 0) as 1 | 0;
    const indMedicoSustituto = (formValues.sustituto === '1' ? 1 : 0) as 1 | 0;
    const idTipoInstitucion: 2 | 1 | null = formValues.tipoInstitucion ?? null

    let tipoInstitucion: TipoInstitucion | null = {idTipoInstitucion: idTipoInstitucion ?? 2}

    const cveOoad = formValues.ooad || null;
    let desOoad: string | null = null;

    if (idTipoInstitucion === null) {
      tipoInstitucion = null
    }

    if (cveOoad) {
      const ooadSeleccionado = this.ooad.find(item => item.value === cveOoad);
      if (ooadSeleccionado) {
        desOoad = ooadSeleccionado.label;
      }
    }

    const horaInicio = formValues.horarioInicio ? dayjs.utc(formValues.horarioInicio).local().format('HH:mm') : null;
    const horaFin = formValues.horarioFin ? dayjs.utc(formValues.horarioFin).local().format('HH:mm') : null;

    return {
      indOtroEmpleo: indOtroEmpleo,
      indMedicoSustituto: indMedicoSustituto,
      tipoInstitucion: tipoInstitucion,
      nomEspecificacionInstitucion: formValues.nombreInstitucion || '',
      cveOoad: cveOoad,
      desOoad: desOoad,
      refJornadaInicio: horaInicio || null, // formato HH:MM
      refJornadaFin: horaFin || null,       // formato HH:MM
      diaSemanaInicio: {
        idDiaSemana: formValues.diaInicio || null
      },
      diaSemanaFin: {
        idDiaSemana: formValues.diaFin || null
      }
    };
  }

  transformarDocumentosConstancia(documentos: EntradaDocumentos): DocumentoConstancia[] {
    if (!documentos) {
      return [];
    }

    const documentosProcesados: DocumentoConstancia[] = Object.keys(documentos).map(key => {
      const docData = documentos[key];
      return {
        refConstancia: docData.nombre,
        documento: {
          refGuid: docData.refGuid
        }
      };
    });

    if (this.idDocumentoConstancia1 && documentosProcesados[0]) {
      documentosProcesados[0].idDocumentoConstancia = this.idDocumentoConstancia1
    }
    if (this.idDocumentoConstancia2 && documentosProcesados[1]) {
      documentosProcesados[1].idDocumentoConstancia = this.idDocumentoConstancia2
    }
    if (this.idDocumentoConstancia3 && documentosProcesados[2]) {
      documentosProcesados[2].idDocumentoConstancia = this.idDocumentoConstancia3
    }

    return documentosProcesados;
  }

  get banderaCargarDocumentacion() {
    const refObligatorio1 = this.documentosLocalStorageService.obtenerRefGuid(1);
    const refObligatorio2 = this.documentosLocalStorageService.obtenerRefGuid(2);
    const refObligatorio3 = this.documentosLocalStorageService.obtenerRefGuid(3);
    const especialidades = this.documentosLocalStorageService.obtenerRefGuidEspecialidad();
    const externo = this.userData?.idPerfil === 3;
    const refConstancia1 = this.documentosLocalStorageService.obtenerRefConstancia(1);
    const refConstancia2 = this.documentosLocalStorageService.obtenerRefConstancia(2);
    const refConstancia3 = this.documentosLocalStorageService.obtenerRefConstancia(3);


    if (this.estatusPendienteDocumentacion) {
      return true;
    }
    if (!refObligatorio1) {
      return true;
    }
    if (!refObligatorio2) {
      return true;
    }
    if (!refObligatorio3) {
      return true;
    }
    if (refConstancia1 && !refConstancia1.nombre) {
      return true;
    }
    if (refConstancia2 && !refConstancia2.nombre) {
      return true;
    }
    if (refConstancia3 && !refConstancia3.nombre) {
      return true;
    }

    /*     const hasTipoInstitucion = this.formDatosEmpleo.get('tipoInstitucion')?.value;
        if(!hasTipoInstitucion){

          return true;
        } */
    if (this.formDatosEmpleo.invalid && externo) {
      return true;
    }


    return especialidades.length === 0;
  }

  get refConstancia1() {
    const refConstancia1 = this.documentosLocalStorageService.obtenerRefConstancia(1);
    return !refConstancia1;
  }

  get refConstancia2() {
    const refConstancia2 = this.documentosLocalStorageService.obtenerRefConstancia(2);

    return !refConstancia2;
  }

  get refConstancia3() {
    const refConstancia3 = this.documentosLocalStorageService.obtenerRefConstancia(3);

    return !refConstancia3;
  }

  suscribirObservablesDatosEmpleo(): void {
    const form = this.formDatosEmpleo;
    form.get('otroEmpleo')?.valueChanges.subscribe(value => {
      if (!this.estatusPendienteDocumentacion) {
        const tieneOtroEmpleo = value === '1'; // '1' = Sí

        // Habilitar/Deshabilitar campos asociados a 'otroEmpleo'
        this.manejoValidaciones(form, 'tipoInstitucion', tieneOtroEmpleo, tieneOtroEmpleo);

        // Reevaluar la dependencia de Horario/Jornada
        this.actualizarHorarioJornadaState(form);
      }
    });

    form.get('tipoInstitucion')?.valueChanges.subscribe((val) => {
      if (!this.estatusPendienteDocumentacion) {
        // Si 'otroEmpleo' es 'Sí', reevalúa 'nombreInstitucion'
        const tieneOtroEmpleo = form.get('otroEmpleo')?.value === '1';
        this.manejarNombreInstitucionLogic(form, tieneOtroEmpleo);
      }
    });

    form.get('sustituto')?.valueChanges.subscribe(value => {
      if (!this.estatusPendienteDocumentacion) {
        const isSustituto = value === '1'; // '1' = Sí

        // Habilitar/Deshabilitar campo OOAD (Punto 5)
        this.manejoValidaciones(form, 'ooad', isSustituto, isSustituto);

        // Reevaluar la dependencia de Horario/Jornada
        /* ooad ya no tendra control sobre los horarios y jornada por peticion*/
        //this.actualizarHorarioJornadaState(form);
      }
    });

    form.get('ooad')?.valueChanges.subscribe(() => {
      //this.actualizarHorarioJornadaState(form);
    });
  }

  private manejarNombreInstitucionLogic(form: FormGroup, isOtroEmpleo: boolean): void {

    const control = form.get('nombreInstitucion');
    const hasTipoInstitucion = !!form.get('tipoInstitucion')?.value; // Verifica si se ha seleccionado Pública o Privada

    // Se habilita si 'otroEmpleo' es 'Sí' Y 'tipoInstitucion' tiene valor.
    const enable = isOtroEmpleo && hasTipoInstitucion;

    // Es obligatorio si se habilita
    this.manejoValidaciones(form, 'nombreInstitucion', enable, enable);
  }

  /*   private actualizarHorarioJornadaState(form: FormGroup): void {

      const tieneOtroEmpleo = form.get('otroEmpleo')?.value === '1';
      const esSustituto = form.get('sustituto')?.value === '1';
      const tieneOoad = !!form.get('ooad')?.value;

      // Habilitar si: (Otro Empleo = Sí) O (Sustituto = Sí Y OOAD tiene valor)
      const enable = tieneOtroEmpleo || (esSustituto && tieneOoad);

      // Son obligatorios en ambos escenarios si se habilitan
      this.manejoValidaciones(form, 'horarioInicio', enable, enable);
      this.manejoValidaciones(form, 'horarioFin', enable, enable);
      this.manejoValidaciones(form, 'diaInicio', enable, enable);
      this.manejoValidaciones(form, 'diaFin', enable, enable);
    } */

  /* SE CAMBIA LOGICA YA QUE SOLO TIENES OTRO EMPLEO PERMITIRA LLENAR HORARIO Y JORNADA */
  private actualizarHorarioJornadaState(form: FormGroup): void {

    const tieneOtroEmpleo = form.get('otroEmpleo')?.value === '1';
    const esSustituto = form.get('sustituto')?.value === '1';
    const tieneOoad = !!form.get('ooad')?.value;

    // Habilitar si: (Otro Empleo = Sí) O (Sustituto = Sí Y OOAD tiene valor)
    const enable = tieneOtroEmpleo;

    // Son obligatorios en ambos escenarios si se habilitan
    this.manejoValidaciones(form, 'horarioInicio', enable, enable);
    this.manejoValidaciones(form, 'horarioFin', enable, enable);
    this.manejoValidaciones(form, 'diaInicio', enable, enable);
    this.manejoValidaciones(form, 'diaFin', enable, enable);

    /*     //Cuando se esta en estatusPendienteDocumentacion, no se esta deshabilitan estos campos
        if(this.estatusPendienteDocumentacion){
          this.formDatosEmpleo.disable();
        } */
  }

  private manejoValidaciones(form: FormGroup, controlName: string, enable: boolean, isRequired: boolean = false): void {
    const control = form.get(controlName);
    if (control) {
      if (enable) {
        control.enable();
        if (isRequired) {
          control.setValidators(Validators.required);
        }
      } else {
        control.disable();
        control.clearValidators();
        control.setValue(null); // Limpiar valor al deshabilitar
      }
      control.updateValueAndValidity();
    }

  }

  obtenerDatosDocumentosEscolaridad(): void {

    const idusuario = this.userData?.idUsuario;
    if (!idusuario) return;
    this._ConvocatoriaService.getDatosDocumentosEscolares(idusuario).subscribe({
      next: (response: any) => {
        if (!response.exito) return;
        const respuesta: RespuestaConsultaDocumentos = response.respuesta;
        if (respuesta.participacion?.resultadoVerificacion) {
          this.estatusPendienteDocumentacion = respuesta.participacion.resultadoVerificacion.estatusVerificacion.desEstatus === 'Pendiente';
          const estatusVerificacion: number = respuesta.participacion.resultadoVerificacion.estatusVerificacion.idEstatusVerificacion;
          this.estatusPendienteDocumentacion = [1, 3, 4].includes(estatusVerificacion);
          if(this.estatusPendienteDocumentacion){
            this.desactivarForms();
          }
          this.estatusValidacionCompletada = [1,3].includes(estatusVerificacion);
          //this.desactivarForms();
        }
        if (respuesta.documentosObligatorios) {
          this.procesarDatosObligatoriosObtenidos(respuesta.documentosObligatorios);
        }
        if (respuesta.especialidadesDocumentos) {
          const especialidades = this.procesarDocumentosEspecialidades(respuesta.especialidadesDocumentos);
          this.documentosLocalStorageService.guardarRefGuidEspecialidad(especialidades);
          this.registrosDocumentosEspecialidad.update(() => especialidades);
        }
        if (respuesta.documentosConstancias) {
          this.procesarDocumentosContancias(respuesta.documentosConstancias);
        }
        if (respuesta.datosEmpleo) {
          this.cargarDatosEmpleoAlFormulario(respuesta.datosEmpleo);
        }
      }
    });
  }

  desactivarForms(): void {
    this.formDocumentosEspecialidad.disable();
    this.formRegistro.disable();
    this.formZonaInteres.disable()
    this.formDatosEmpleo.disable();
  }

  procesarDatosObligatoriosObtenidos(datos: RespuestaDocumentosObligatorios[]): void {
    const refObligatorio1 = datos.find(d => d.tipoDocumentoObligatorio.idDocumentoObligatorio === 1)?.documento.refGuid;
    const refObligatorio2 = datos.find(d => d.tipoDocumentoObligatorio.idDocumentoObligatorio === 2)?.documento.refGuid;
    const refObligatorio3 = datos.find(d => d.tipoDocumentoObligatorio.idDocumentoObligatorio === 3)?.documento.refGuid;
    if (refObligatorio1) {
      this.obtenerDocumento(refObligatorio1, 'obligatorio', 1);
      this.idDocumentoINE = datos.find(d => d.tipoDocumentoObligatorio.idDocumentoObligatorio === 1)?.idDocumentoObligatorio;
    }
    if (refObligatorio2) {
      this.obtenerDocumento(refObligatorio2, 'obligatorio', 2);
      this.idDocumentoTitulo = datos.find(d => d.tipoDocumentoObligatorio.idDocumentoObligatorio === 2)?.idDocumentoObligatorio;
    }
    if (refObligatorio3) {
      this.obtenerDocumento(refObligatorio3, 'obligatorio', 3);
      this.idDocumentoCedula = datos.find(d => d.tipoDocumentoObligatorio.idDocumentoObligatorio === 3)?.idDocumentoObligatorio;
    }
  }

  procesarDocumentosContancias(datos: RespuestaDocumentosConstancia[]): void {
    const refConstancia1 = datos.length > 0 ? datos[0].documento.refGuid : null;
    const refConstancia2 = datos.length > 1 ? datos[1].documento.refGuid : null;
    const refConstancia3 = datos.length > 2 ? datos[2].documento.refGuid : null;
    if (refConstancia1) {
      this.obtenerDocumento(refConstancia1, 'constancia', 1, datos[0].refConstancia);
      this.idDocumentoConstancia1 = datos[0].idDocumentoConstancia;
    }
    if (refConstancia2) {
      this.obtenerDocumento(refConstancia2, 'constancia', 2, datos[1].refConstancia);
      this.idDocumentoConstancia2 = datos[1].idDocumentoConstancia;
    }
    if (refConstancia3) {
      this.obtenerDocumento(refConstancia3, 'constancia', 3, datos[2].refConstancia);
      this.idDocumentoConstancia3 = datos[2].idDocumentoConstancia;
    }
  }

  procesarDocumentosEspecialidades(datos: RespuestaDocumentosEspecialidad[]): TabNode[] {
    return datos.map((data: RespuestaDocumentosEspecialidad) => {
      const documentosTab: TabDocumento[] = data.documentosEspecialidad.map(
        (item: ItemDocumentoEspecialidad) => ({
          idDocumentoEspecialidad: item.idDocumentoEspecialidad,
          tipoDocumento: item.tipoDocumentoEspecialidad.desTipoDocumentoEspecialidad,
          especialidadMedica: data.desEspecialidad,
          cveEspecialidad: data.cveEspecialidad,
          idDocumento: item.tipoDocumentoEspecialidad.idTipoDocumentoEspecialidad,
          guid: item.documento.refGuid,
        })
      );

      const tabNode: TabNode = {
        especialidad: data.desEspecialidad,
        documentos: documentosTab,
      };

      return tabNode;
    });
  }

  cargarDatosEmpleoAlFormulario(datos: RespuestaDatosEmpleo): void {

    const otroEmpleoValue = datos.indOtroEmpleo?.toString() || '0';
    const sustitutoValue = datos.indMedicoSustituto?.toString() || '0';
    const ooadValue = datos.cveOoad || null;

    this.formDatosEmpleo.patchValue({
      // Combos Sí/No
      otroEmpleo: otroEmpleoValue,
      sustituto: sustitutoValue,

      // OOAD
      ooad: ooadValue,

      // Tipo de Institución y Nombre
      tipoInstitucion: (datos.tipoInstitucion ? datos.tipoInstitucion.idTipoInstitucion : null) || null,
      nombreInstitucion: datos.nomEspecificacionInstitucion || null,

      // Horario/Jornada
      horarioInicio: datos.refJornadaInicio ? dayjs(datos.refJornadaInicio, 'HH:mm:ss').toDate() : null,
      horarioFin: datos.refJornadaInicio ? dayjs(datos.refJornadaFin, 'HH:mm:ss').toDate() : null,

      // Días
      diaInicio: datos.diaSemanaInicio?.idDiaSemana ?? null,
      diaFin: datos.diaSemanaFin?.idDiaSemana ?? null,
    });
  }

  mostrarDocumento(guid: string) {
    this.documentoService.obtenerDocumento(guid).subscribe({
      next: (response: any) => {

        const tipoArchivo = response.type;
        const fileBlob = new Blob([response], {type: tipoArchivo});
        const fileURL = URL.createObjectURL(fileBlob);

        // 3. Abrir en una nueva pestaña
        window.open(fileURL, '_blank');
      }
    });
  }

  eliminarArchivoObligatorio(id: number) {
    this.documentosLocalStorageService.eliminarArchivoObligatorio(id);
  }

  eliminarConstancia(id: number) {
    this.documentosLocalStorageService.eliminarArchivoConstancia(id);
    if (id === 1) {
      this.archivoConstancia1 = null;
      this.nombreConstancia1 = '';
      const uploader = this.uploaders.find(comp => comp.idArchivo === 'constancia_1');
      if (uploader) {
        uploader.clear();
      }
      const idEliminado = this.constanciasPorEliminar.some(id => id === this.idDocumentoConstancia1);
      if (this.idDocumentoConstancia1 && !idEliminado) {
        this.constanciasPorEliminar.push(this.idDocumentoConstancia1);
      }
    }
    if (id === 2) {
      this.archivoConstancia2 = null;
      this.nombreConstancia2 = '';
      const uploader = this.uploaders.find(comp => comp.idArchivo === 'constancia_2');
      if (uploader) {
        uploader.clear();
      }
      const idEliminado = this.constanciasPorEliminar.some(id => id === this.idDocumentoConstancia2);
      if (this.idDocumentoConstancia2 && !idEliminado) {
        this.constanciasPorEliminar.push(this.idDocumentoConstancia2);
      }
    }
    if (id === 3) {
      this.archivoConstancia3 = null;
      this.nombreConstancia3 = '';
      const uploader = this.uploaders.find(comp => comp.idArchivo === 'constancia_3');
      if (uploader) {
        uploader.clear();
      }
      const idEliminado = this.constanciasPorEliminar.some(id => id === this.idDocumentoConstancia3);
      if (this.idDocumentoConstancia3 && !idEliminado) {
        this.constanciasPorEliminar.push(this.idDocumentoConstancia3);
      }
    }
  }

  eliminarDocumentosObligatorios(id: number) {
    this.documentosLocalStorageService.eliminarArchivoObligatorio(id);
    if (id === 1) {
      this.archivoINE = null;
      const uploader = this.uploaders.find(comp => comp.idArchivo === 'INE');
      if (uploader) {
        uploader.clear();
      }
    }
    if (id === 2) {
      this.archivoTitulo = null;
      this.nombreConstancia2 = '';
      const uploader = this.uploaders.find(comp => comp.idArchivo === 'titulo');
      if (uploader) {
        uploader.clear();
      }
    }
    if (id === 3) {
      this.archivoCedula = null;
      this.nombreConstancia3 = '';
      const uploader = this.uploaders.find(comp => comp.idArchivo === 'cedula');
      if (uploader) {
        uploader.clear();
      }
    }
  }

  limpiarPrimeraSeccion() {
    this.formRegistro.reset();
    this.formZonaInteres.reset();
    this.zonasInteres.set([]);
    this.municipios = [];
    this.colonias = [];
    this.defaultFile = undefined;
    this.settearDatosUsuario();
  }

  limpiarSegundaSeccion() {
    if (this.estatusPendienteDocumentacion) return;
    this.eliminarConstancia(1);
    this.eliminarConstancia(2);
    this.eliminarConstancia(3);
    this.eliminarDocumentosObligatorios(1);
    this.eliminarDocumentosObligatorios(2);
    this.eliminarDocumentosObligatorios(3);
    this.limpiarDocumentoEspecialidad();
    this.formDatosEmpleo.reset({otroEmpleo: '0', sustituto: '0'});
    this.registrosDocumentosEspecialidad.update(() => []);
    this.documentosLocalStorageService.limpiar();
  }

  cambioDeSeccion($event: any) {
    if ($event === 2 && !this.estatusValidacionCompletada) {
      return;
    }
    if ($event === 1) {
      /* validar que el primer formulario este completo */
      if (this.formRegistro.invalid) {
        this._alertServices.alerta("Recuerde completar los datos del formulario y guardar antes de pasar a la siguiente sección.");
        return;
      }

      if (!this.blnFotoGuardada || this.zonasInteres().length == 0) {
        this._alertServices.alerta("Recuerde completar los datos del formulario y guardar antes de pasar a la siguiente sección.");
        return
      }
    }

    this.indice.update(() => $event);
  }

  obtenerGuidDocumento($event: boolean, tipo: 'obligatorio' | 'constancia', id: number): void {
    if (!$event) return;
    if (tipo === 'obligatorio') {
      const guid = this.documentosLocalStorageService.obtenerRefGuid(id);
      this.mostrarDocumento(guid);
    }
    if (tipo === 'constancia') {
      const guid = this.documentosLocalStorageService.obtenerRefConstancia(id).refGuid;
      this.mostrarDocumento(guid);
    }
  }

  validarIndicadores(): boolean {
    let checkInd = false;
    if(
      this.formRegistro.get("indPadres")?.value ||
      this.formRegistro.get("indHijos")?.value ||
      this.formRegistro.get("indConyuge")?.value ||
      this.formRegistro.get("indOtros")?.value ||
      this.formRegistro.get("indNinguno")?.value
    ){checkInd = true}

    return !checkInd;
  }


}
