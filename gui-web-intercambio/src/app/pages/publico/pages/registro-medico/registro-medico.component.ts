import { Especialidad } from './../../../../core/models/especialidad';
import {ResponseGeneral} from '@models/responseGeneral';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {GeneralComponent} from '@components/general.component';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Select} from 'primeng/select';
import {Button} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {HttpErrorResponse} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {CatPais, CatPaisResponse, CatSubperfil, CatSubperfilResponse} from '@models/catalogoGeneral';
import {
  AreaMedicaData,
  RegistroCurpRequest,
  RegistroInternoRequest,
  RegistroMedico,
  RegistroPasaporteRequest
} from '@models/datosMedico';
import {BtnRegresarComponent} from '@components/btn-regresar/btn-regresar.component';
import {passwordValidator} from '@validators/password-validator';
import {PATRON_CURP, PATRON_MATRICULA, PATRON_NOMBRE, PATRON_PASAPORTE, PATRON_RFC} from '@utils/regex';
import {AlphanumericDirective} from '@directives/only-alphanumeric.directive';
import {PrimeTemplate} from 'primeng/api';

@Component({
  selector: 'app-registro-medico',
  imports: [
    Card,
    Button,
    Select,
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    BtnRegresarComponent,
    AlphanumericDirective,
    PrimeTemplate,
  ],
  standalone: true,
  templateUrl: './registro-medico.component.html',
  styleUrl: './registro-medico.component.scss'
})
export class RegistroMedicoComponent extends GeneralComponent implements OnInit, OnDestroy {

  fb = inject(FormBuilder)
  form!: FormGroup;
  usuarioValidado = false;

  strTitulo!: string;
  medico!: RegistroMedico;
  lstModalidad!: Array<CatSubperfil>;
  lstPais!: Array<CatPais>;

  ruta: string = '';

  inMatricula: boolean = false;
  inNombre: boolean = false;
  inCurp: boolean = false;
  inRfc: boolean = false;
  inAp: boolean = false;
  inAm: boolean = false;
  inCorreo: boolean = false;
  inPasaporte: boolean = false;
  inPais: boolean = false;
  inCorreo2: boolean = false;
  inPass: boolean = false;
  inPass2: boolean = false;
  idModalidad!: number;
  AREA_MEDICA_DATA: AreaMedicaData = new AreaMedicaData;

  ngOnInit(): void {
    this.ruta = this._nav.publico + this._nav.crearCuenta;
    this.blnPassIguales = false;
    this.blnCorreosIguales = false;
    this.getCatalogoModalidad();
    this.form = this.inicializarForm();
    this.msjForm();
    this.blnBtnValidar = true;
    let x = this.getSession('registroMedico');

    if (x) {
      this.medico = x;
      //console.log("meduico: ",this.medico);
      this.medico.documentoVerif = x.documentoVerif;
      this.medico.refCurp = '';
      this.idModalidad = this.medico.modalidad;
      this.form.controls['modalidad'].setValue(this.medico.modalidad);
      if (this.medico.blnInterno) {
        this.isResidente();

      } else {

        this.isExterno();
        if (this.medico.blnPasaporte) {
          return this.isPasaporte();
        }
        return this.isCurp();

      }
    } else {
      this.medico = new RegistroMedico();
    }
  }

  /* Gestión Catalogos */

  getCatalogoModalidad(): void {
    this.lstModalidad = new Array<CatSubperfil>();
    this._CatalogoGenService.getLstSubPerfil().subscribe((response: CatSubperfilResponse) => {
      if (response.exito) {
        this.lstModalidad = response.respuesta;
      }
    });
  }

  getCatalogoPais(): void {
    this.lstPais = new Array<CatPais>();
    this._CatalogoGenService.getLstPais().subscribe((response: CatPaisResponse) => {
      if (response.exito) {
        this.lstPais = response.respuesta;
      }
    });
  }

  /* Formularios */

  inicializarForm(): FormGroup {
    return this.fb.group({
      modalidad: ['', ''],
      matricula: ['', ''],
      pasaporte: ['', ''],
      pais: ['', ''],
      nombre: ['', [Validators.required, Validators.pattern(PATRON_NOMBRE)]],
      apellidoP: ['', [Validators.required, Validators.pattern(PATRON_NOMBRE)]],
      apellidoM: ['', [Validators.required, Validators.pattern(PATRON_NOMBRE)]],
      curp: ['', Validators.compose([
        Validators.required,
        Validators.minLength(18),
        Validators.maxLength(18),
        Validators.pattern(PATRON_CURP),
      ])],
      rfc: ['', Validators.compose([
        // Validators.required,
        Validators.minLength(13),
        Validators.maxLength(13),
        Validators.pattern(PATRON_RFC)
      ])],
      correo: ['', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100), Validators.email,
        //Validators.pattern(PATRON_EMAIL)

      ])],
      correoc: ['', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(100),
        Validators.email,
        //Validators.pattern(PATRON_EMAIL)
      ])],
      pass: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        passwordValidator()
      ])],
      passc: ['', Validators.compose([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(12),
        passwordValidator()
      ])],
    });
  }

  ngOnDestroy() {
    this.removeSession('registroMedico');
  }

  private activarCampos(blnInterno: boolean) {
    this.inNombre = true;
    this.inRfc = true;
    this.inAp = true;
    this.inAm = true;
    this.inCorreo = true;
    this.inCorreo2 = true;
    this.inPass = true;
    this.inPass2 = true;
    switch (blnInterno) {
      case true:

        this.dinamicoCurp();

        break;
      case false://
        this.dinamicoCurp();

        if (this.medico.blnPasaporte) {
          this.inPasaporte = true;
          this.inPais = true;

          break;
        }

        break;

      default:
        break;
    }
  }

  private clearCampos() {
    this.form.controls['matricula'].setValidators([]);
    this.form.controls['modalidad'].setValidators([]);
    this.form.controls['pasaporte'].setValidators([]);
    this.form.controls['pais'].setValidators([]);
    this.form.controls['modalidad'].updateValueAndValidity();
    this.form.controls['pasaporte'].updateValueAndValidity();
    this.form.controls['pais'].updateValueAndValidity();
    this.form.controls['matricula'].updateValueAndValidity();
    this.inNombre = false;
    this.inCurp = false;
    this.inRfc = false;
    this.inAp = false;
    this.inAm = false;
    this.inPais = false;
    this.inPasaporte = false;
  }

  private isPasaporte() {
    this.usuarioValidado = true;
    this.getCatalogoPais();
    this.clearCampos();
    this.form.controls['modalidad'].setValidators([Validators.required]);
    this.form.controls['pasaporte'].setValidators([Validators.required, Validators.minLength(6),
      Validators.maxLength(9), Validators.pattern(PATRON_PASAPORTE)]);
    this.form.controls['pais'].setValidators([Validators.required]);
    this.form.controls['modalidad'].updateValueAndValidity();
    this.form.controls['pasaporte'].updateValueAndValidity();
    this.form.controls['pais'].updateValueAndValidity();
    this.dinamicoCurp();
  }

  private isCurp() {
    this.form.controls['curp'].setValidators([Validators.required, Validators.minLength(18),
      Validators.maxLength(18),
      Validators.pattern(PATRON_CURP)]);
    this.form.controls['curp'].updateValueAndValidity();

    this.form.controls['rfc'].setValidators([Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13),
      Validators.pattern(PATRON_RFC)]);
    this.form.controls['rfc'].updateValueAndValidity();

    this.inCurp = true;

  }

  private isNotCurp() {
    this.form.controls['curp'].setValidators([]);
    this.form.controls['curp'].updateValueAndValidity();
    this.inCurp = false;
  }

  private isResidente() {
    this.strTitulo = 'Residente IMSS';
    this.clearCampos();
    this.form.controls['rfc'].setValidators([Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13),
      Validators.pattern(PATRON_RFC)]);
    this.form.controls['rfc'].updateValueAndValidity();

    this.form.controls['matricula'].setValidators([Validators.required,
      Validators.minLength(6),
      Validators.maxLength(10),
      Validators.pattern(PATRON_MATRICULA)]);
    this.form.controls['matricula'].updateValueAndValidity();
  }

  private isExterno() {
    this.strTitulo = 'Médico externo';
    this.clearCampos();
    this.form.controls['modalidad'].setValidators([Validators.required]);
    this.form.controls['modalidad'].updateValueAndValidity();
  }

  msjValidation: any = {};

  msjForm(): void {
    this.msjValidation = {
      'modalidad': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},],
      'matricula': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_MATRICULA},
        {type: 'minlength', msj: this._Mensajes.MSJ_LONG_MATRICULA},
      ],
      'pasaporte': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},
        {type: 'minlength', msj: this._Mensajes.MSJ_LONG_PASAPORTE},
      ],
      'pais': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},],
      'nombre': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},
      ],
      'apellidoP': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},],
      'apellidoM': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},],
      'curp': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'minlength', msj: this._Mensajes.MSJ_LONG_CURP},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},
      ],

      'rfc': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'minlength', msj: this._Mensajes.MSJ_LONG_RFC},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},
      ],
      'correo': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},
        {type: 'email', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},

      ],
      'correoc': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        {type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},
        {type: 'email', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO},

      ],
      'pass': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        //{ type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO },
        {type: 'caracter', msj: this._Mensajes.MSJ_PASS_CARACTER_ESPECIAL},
        {type: 'numero', msj: this._Mensajes.MSJ_PASS_NUMERO},
        {type: 'minLength', msj: this._Mensajes.MSJ_PASS_MIN_CARACTER},
        {type: 'maxLength', msj: this._Mensajes.MSJ_PASS_MAX_CARACTER},
        {type: 'mayuscula', msj: this._Mensajes.MSJ_PASS_MAYUSCULA},
        {type: 'minuscula', msj: this._Mensajes.MSJ_PASS_MINUSCULA},
      ],
      'passc': [
        {type: 'required', msj: this._Mensajes.MSJ_CAMPO_REQUERIDO},
        //{ type: 'pattern', msj: this._Mensajes.MSJ_FORMATO_NO_VALIDO },
        {type: 'caracter', msj: this._Mensajes.MSJ_PASS_CARACTER_ESPECIAL},
        {type: 'numero', msj: this._Mensajes.MSJ_PASS_NUMERO},
        {type: 'minLength', msj: this._Mensajes.MSJ_PASS_MIN_CARACTER},
        {type: 'maxLength', msj: this._Mensajes.MSJ_PASS_MAX_CARACTER},
        {type: 'mayuscula', msj: this._Mensajes.MSJ_PASS_MAYUSCULA},
        {type: 'minuscula', msj: this._Mensajes.MSJ_PASS_MINUSCULA},
      ],


    }


  }

  get f() {
    return this.form.controls;
  }

  blnBtnValidar!: boolean;

  public desbloquearValidar() {
    this.blnBtnValidar = true;
    this.medico.refCurp = this.form.controls['curp'].value
    if (this.medico.refCurp.length == 18) {
      this.blnBtnValidar = false;
    }
  }

  public btnValidarCurp() {
    this.medico.refCurp = this.form.controls['curp'].value;
    // this.form.markAllAsTouched();
    this.validarCURP();

    //  this._alertServices.alerta(this._Mensajes.MSG010b);

  }

  datosCURP!: any;

  private validarCURP() {

    this.inCurp = true;

    let datos = {
      curp: this.medico.refCurp,
      idPerfil: this.medico.perfil.idPerfil
    }

    this._RegistroMedicoService.getDatosByCurp(datos).subscribe({
      next: (response: any) => {
      if (!response.exito) {
        this.usuarioValidado = false;
        // this.limpiarMatricula();
        this._alertServices.error(response.mensaje);
        this.form.get('nombre')?.enable();
        this.form.get('apellidoP')?.enable();
        this.form.get('apellidoM')?.enable();
      } else {
        this.usuarioValidado = true;
        this.datosCURP = response.respuesta;
        this.form.controls['nombre'].setValue(response.respuesta.renapoData.nombres ? response.respuesta.renapoData.nombres : response.respuesta.siapData.nombre);
        this.form.controls['apellidoP'].setValue(response.respuesta.renapoData.primerApellido ? response.respuesta.renapoData.primerApellido : response.respuesta.siapData.primerApellido);
        this.form.controls['apellidoM'].setValue(response.respuesta.renapoData.segundoApellido ? response.respuesta.renapoData.segundoApellido : response.respuesta.siapData.segundoApellido);
        this.form.controls['curp'].setValue(response.respuesta.renapoData.curp ?? '');
        this.form.controls['rfc'].setValue(response.respuesta.siapData?.rfc ?? '');
        //this.form.controls['modalidad'].setValue(this.idModalidad);
        this.form.get('nombre')?.disable();
        this.form.get('apellidoP')?.disable();
        this.form.get('apellidoM')?.disable();
        this.activarCampos(this.medico.blnInterno);
        this.dinamicoCurp();
        this.asignarDatos();
      }
    },
      error: (err: HttpErrorResponse) => {
        const statusCode = err.status;
          let messageToDisplay: string;

          if (statusCode === 0) {
            // Es un error de red (como un 504 timeout o desconexión).
            messageToDisplay = 'Error de conexión. El servidor no respondió a tiempo. Intente de nuevo más tarde.';

            // Opcional: Puedes ver en la consola si hay detalles en err.error
            console.error('Error de red detectado. Cuerpo de error:', err.error);

          } else if (statusCode >= 400 && statusCode < 600) {
            // Es un error HTTP estándar (4xx, 5xx), pero con cuerpo de respuesta.
            // Intenta extraer un mensaje del cuerpo, si lo hay.
            messageToDisplay = err.error?.message || `Error del servidor (Código ${statusCode}).`;
          } else {
            // Cualquier otro caso.
            messageToDisplay = 'Ocurrió un error desconocido.';
          }

          this._alertServices.error(messageToDisplay);
          }

    });


    this.activarCampos(this.medico.blnInterno);

  }

  btnAnterior() {
    this._router.navigate(['publico/' + this._nav.crearCuenta]);
  }


  public btnCrearCuenta() {

    this.asignarDatos();

    if (this.form.valid) {


      if (this.blnCorreosIguales) {


        if (this.blnPassIguales) {

          if (this.medico.blnInterno) {

            return this.postResidente();
          } else {
            if (this.medico.blnPasaporte) {

              return this.postPasaporte();

            }

            return this.postCurp();

          }


        }
        return this._alertServices.alerta(this._Mensajes.MSG007);


      }
      return this._alertServices.alerta(this._Mensajes.MSG0077);


    } else {

      this._alertServices.alerta(this._Mensajes.MSG013);
      this.activarCampos(this.medico.blnInterno);
    }
  }


  postResidente() {
    let residente = new RegistroInternoRequest();
    residente.cveMatricula = this.medico.cveMatricula;
    residente.idPerfil = this.medico.perfil.idPerfil;
    residente.nomApellidoMaterno = this.medico.nomApellidoMaterno;
    residente.nomApellidoPaterno = this.medico.nomApellidoPaterno;
    residente.nomNombre = this.medico.nomNombre;
    residente.refCurp = this.medico.refCurp;
    residente.refRfc = this.medico.refRfc;
    residente.refEmail = this.medico.refEmail;
    residente.refContrasenaHash = this.medico.refContrasenaHash;
    residente.requiereFolio = true;

    residente.areaMedicaData = this.AREA_MEDICA_DATA;

    this._RegistroMedicoService.registrarResidente(residente).subscribe({
      next: (data: ResponseGeneral) => {

        if (data.exito) {
          return this.paginaAnterior();
        } else {
          if (data.mensaje.includes('existe una cuenta')) {
            return this.paginaInicio(data.mensaje);
          }
          return this._alertServices.error(data.mensaje);
        }
      },
      error: (err: HttpErrorResponse) => {
        this._alertServices.error(err.message);

      }
    });
  }

  postPasaporte() {
    let pasaporte = new RegistroPasaporteRequest();
    pasaporte.refEmail = this.medico.refEmail;
    pasaporte.refContrasenaHash = this.medico.refContrasenaHash;
    pasaporte.idPerfil = this.medico.perfil.idPerfil;
    pasaporte.idSubperfil = this.medico.modalidad;
    pasaporte.idDocumentoVerificacion = this.medico.documentoVerif.idDocumentoVerificacion;
    pasaporte.nomNombre = this.medico.nomNombre;
    pasaporte.nomApellidoMaterno = this.medico.nomApellidoMaterno;
    pasaporte.nomApellidoPaterno = this.medico.nomApellidoPaterno;
    pasaporte.pasaporte = this.medico.pasaporte;
    pasaporte.idPaisEmision = this.medico.pais;
    pasaporte.refCurp = this.medico.refCurp;
    pasaporte.refRfc = this.medico.refRfc;


    this._RegistroMedicoService.registrarPasaporte(pasaporte).subscribe({
      next: (data: ResponseGeneral) => {

        if (data.exito) {
          return this.paginaAnterior();
        } else {
          if (data.mensaje.includes('existe una cuenta')) {
            return this.paginaInicio(data.mensaje);
          }
          return this._alertServices.error(data.mensaje);
        }

      },
      error: (err: HttpErrorResponse) => {
        this._alertServices.error(err.message);

      }
    });
  }

  postCurp() {

    let curp = new RegistroCurpRequest();

    curp.refEmail = this.medico.refEmail;
    curp.refContrasenaHash = this.medico.refContrasenaHash;
    curp.idPerfil = this.medico.perfil.idPerfil;
    curp.idSubperfil = this.medico.modalidad;
    curp.idDocumentoVerificacion = this.medico.documentoVerif.idDocumentoVerificacion;
    curp.nomNombre = this.medico.nomNombre;
    curp.nomApellidoMaterno = this.medico.nomApellidoMaterno;
    curp.nomApellidoPaterno = this.medico.nomApellidoPaterno;
    curp.requiereFolio = true;
    curp.refCurp = this.medico.refCurp;
    curp.refRfc = this.medico.refRfc;
    curp.areaMedicaData = new AreaMedicaData();
    curp.areaMedicaData.CURP = curp.refCurp;
    curp.areaMedicaData.MATRICULA = this.datosCURP.siapData?.matricula ?? '';
    curp.areaMedicaData.NOMBRE = curp.nomNombre;
    curp.areaMedicaData.APELLIDO_PATERNO = curp.nomApellidoPaterno;
    curp.areaMedicaData.APELLIDO_MATERNO = curp.nomApellidoMaterno;
    this._RegistroMedicoService.registrarCurp(curp).subscribe({
      next: (data: ResponseGeneral) => {

        if (data.exito) {
          return this.paginaAnterior();
        } else {
          if (data.mensaje.includes('existe una cuenta')) {
            return this.paginaInicio(data.mensaje);
          }
          return this._alertServices.error(data.mensaje);
        }

      },
      error: (err: HttpErrorResponse) => {
        this._alertServices.error(err.message);

      }
    });
  }


  private paginaAnterior() {
    void this._router.navigate(['publico/inicio-sesion']);
    setTimeout(() => {
      this._alertServices.exito(this._Mensajes.MSG012);
    }, 500);
  }

  blnCorreosIguales!: boolean;
  blnPassIguales!: boolean;

  public compararCorreos() {
    this.medico.refEmail = this.form.controls['correo'].value;
    this.medico.correo2 = this.form.controls['correoc'].value;

    if (this.medico.refEmail.length === 0 || this.medico.correo2.length === 0) {
      this.blnCorreosIguales = false;
      return;
    }

    const sonIguales: boolean = this.comparaCampos(this.medico.refEmail, this.medico.correo2);
    this.blnCorreosIguales = sonIguales;

    if (!sonIguales) {
      this._alertServices.alerta(this._Mensajes.MSG0077);
    }
  }

  public compararPassword() {
    this.medico.refContrasenaHash = this.form.controls['pass'].value;
    this.medico.password2 = this.form.controls['passc'].value;
    if (this.medico.refContrasenaHash.length > 0 && this.medico.password2.length > 0) {
      this.blnPassIguales = false;
      if (this.comparaCampos(this.medico.refContrasenaHash, this.medico.password2)) {
        this.blnPassIguales = true;
        return;
      }
      return this._alertServices.alerta(this._Mensajes.MSG007);
    }
  }

  cambiaModalidad() {
    this.medico.modalidad = this.form.controls['modalidad'].value;
  }

  cambiaPais() {
    this.medico.pais = this.form.controls['pais'].value;
  }


  public dinamicoCurp() {
    this.medico.refCurp = this.form.controls['curp'].value
    if (this.medico.refCurp.length > 0) {
      return this.isCurp();
    }
    return this.isNotCurp();
  }


  public btnValidarMatricula() {
    this.medico.cveMatricula = this.form.controls['matricula'].value;
    if (this.medico.cveMatricula.length >= 6) {
      return this.validarMatricula();
    } else {
      return this._alertServices.alerta(this._Mensajes.MSG010a);
    }
  }

  private limpiarMatricula() {
    this.form.controls['matricula'].setValue('');
    this.medico.cveMatricula = this.form.controls['matricula'].value
    this.form.reset();
  }

  public limpiarMatriculaChange() {

    let tmp = this.form.controls['matricula'].value;
    this.limpiarMatricula();
    this.form.controls['matricula'].setValue(tmp);

  }


  public limpiarCurpChange() {
    let tmpModalidad = this.form.controls['modalidad'].value;
    let tmp = this.form.controls['curp'].value;
    this.form.reset();
    this.form.controls['curp'].setValue(tmp);
    this.form.controls['modalidad'].setValue(tmpModalidad);

  }

private validarMatricula() {

    let datos = {
      matricula: this.medico.cveMatricula,
      idPerfil: this.medico.perfil.idPerfil

    }

    this._RegistroMedicoService.getDatosByMatricula(datos).subscribe({
      next: (response: any) => {
      if (!response.exito) {
        this.usuarioValidado = false;
        this.limpiarMatricula();
        this._alertServices.error(response.mensaje);
        this.form.get('nombre')?.enable();
        this.form.get('apellidoP')?.enable();
        this.form.get('apellidoM')?.enable();
        this.form.get('curp')?.enable();
        this.form.get('rfc')?.enable();
      } else {
        this.usuarioValidado = true;
        this.AREA_MEDICA_DATA = response.respuesta.areaMedicaData;
        this.form.controls['nombre'].setValue(response.respuesta.areaMedicaData.NOMBRE ? response.respuesta.areaMedicaData.NOMBRE : response.respuesta.siapData.nombre);
        this.form.controls['apellidoP'].setValue(response.respuesta.areaMedicaData.APELLIDO_PATERNO ? response.respuesta.areaMedicaData.APELLIDO_PATERNO : response.respuesta.siapData.primerApellido);
        this.form.controls['apellidoM'].setValue(response.respuesta.areaMedicaData.APELLIDO_MATERNO ? response.respuesta.areaMedicaData.APELLIDO_MATERNO : response.respuesta.siapData.segundoApellido);
        this.form.controls['curp'].setValue(response.respuesta.areaMedicaData.CURP ?? '');
        this.form.controls['rfc'].setValue(response.respuesta.siapData.rfc ?? '');
        this.form.get('nombre')?.disable();
        this.form.get('apellidoP')?.disable();
        this.form.get('apellidoM')?.disable();
        this.form.get('curp')?.disable();
        this.form.get('rfc')?.disable();
        this.activarCampos(this.medico.blnInterno);
        this.dinamicoCurp();
        this.asignarDatos();
      }},
      error: (err: HttpErrorResponse) => {
        const statusCode = err.status;
          let messageToDisplay: string;

          if (statusCode === 0) {
            // Es un error de red (como un 504 timeout o desconexión).
            messageToDisplay = 'Error de conexión. El servidor no respondió a tiempo. Intente de nuevo más tarde.';

            // Opcional: Puedes ver en la consola si hay detalles en err.error
            console.error('Error de red detectado. Cuerpo de error:', err.error);

          } else if (statusCode >= 400 && statusCode < 600) {
            // Es un error HTTP estándar (4xx, 5xx), pero con cuerpo de respuesta.
            // Intenta extraer un mensaje del cuerpo, si lo hay.
            messageToDisplay = err.error?.message || `Error del servidor (Código ${statusCode}).`;
          } else {
            // Cualquier otro caso.
            messageToDisplay = 'Ocurrió un error desconocido.';
          }

          this._alertServices.error(messageToDisplay);
          }
        });

  }

  private asignarDatos() {
    this.medico.nomNombre = this.form.controls['nombre'].value;
    this.medico.nomApellidoPaterno = this.form.controls['apellidoP'].value;
    this.medico.nomApellidoMaterno = this.form.controls['apellidoM'].value;
    this.medico.refCurp = this.form.controls['curp'].value;
    this.medico.refRfc = this.form.controls['rfc'].value;
    if (this.medico.blnPasaporte) {
      this.medico.pasaporte = this.form.controls['pasaporte'].value;
      this.medico.pais = this.form.controls['pais'].value;
    }
    this.dinamicoCurp();
  }

  get habilitarBtnMatricula() {
    const matricula = this.form.controls['matricula'];
    if (!matricula.value) return true;

    return matricula.value.length > 10;
    /* return matricula.value.length !== 10; */
  }

  private paginaInicio(mensaje: string) {
    void this._router.navigate(['publico/inicio-sesion']);
    setTimeout(() => {
      this._alertServices.error(mensaje);
    }, 500);
  }

}
