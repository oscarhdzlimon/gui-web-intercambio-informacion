import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms"; // Import FormsModule
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {Select} from 'primeng/select';
import {RadioButton, RadioButtonModule} from 'primeng/radiobutton';
import {GeneralComponent} from '@components/general.component';
import {CommonModule} from '@angular/common';
import {RegistroMedico} from '@models/datosMedico';
import {
  CatDocumentoVerificacion,
  CatDocVerifResponse,
  CatPerfil,
  CatPerfilResponse,
  CatSubperfil,
  CatSubperfilResponse
} from '@models/catalogoGeneral';
import {BtnRegresarComponent} from '@components/btn-regresar/btn-regresar.component';

@Component({
  selector: 'app-crear-cuenta',
  imports: [
    Card,
    Button,
    Select,
    ReactiveFormsModule,
    CommonModule,
    RadioButtonModule,
    FormsModule,
    RadioButton,
    BtnRegresarComponent,
  ],
  standalone: true,
  templateUrl: './crear-cuenta.component.html',
  styleUrl: './crear-cuenta.component.scss'
})
export class CrearCuentaComponent extends GeneralComponent implements OnInit {

  fb = inject(FormBuilder)
  form!: FormGroup;
  blnSeleccionado = false;

  ruta: string = '';
  lstPerfil !: any;
  lstModalidad!: Array<CatSubperfil>;
  lstDocumentos!: Array<CatDocumentoVerificacion>;
  registroMedico!: RegistroMedico;
  blnResidente!: boolean;

  private readonly DOCUMENTO_PASAPORTE: string = 'PASAPORTE';

  ngOnInit() {
    this.ruta = this._nav.publico + this._nav.inicioSesion;
    this.registroMedico = new RegistroMedico();
    this.blnResidente = true;
    this.blnSeleccionado = false;
    this.form = this.inicializarForm();
    this.getCatalogoPerfiles();
  }

  getCatalogoPerfiles(): void {
    this.lstPerfil = new Array<CatPerfil>();
    this._CatalogoGenService.getLstPerfil().subscribe((response: CatPerfilResponse) => {
      if (!response.exito) return;
      this.lstPerfil = response.respuesta;
    });
  }

  getCatalogoModalidad(): void {
    this.lstModalidad = new Array<CatSubperfil>();
    this._CatalogoGenService.getLstSubPerfil().subscribe((response: CatSubperfilResponse) => {
      if (!response.exito) return;
      this.lstModalidad = response.respuesta;
    });
  }

  getCatalogoDocumento(): void {
    this.lstDocumentos = new Array<CatDocumentoVerificacion>();
    this._CatalogoGenService.getLstDocumentosVerificacion().subscribe((response: CatDocVerifResponse) => {
      if (!response.exito) return;
      this.lstDocumentos = response.respuesta;
    });
  }

  inicializarForm(): FormGroup {
    return this.fb.group({
      perfil: ['', [Validators.required]],
      modalidad: ['', ''],
      documento: ['', ''],
    });
  }

  public btnAceptar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const documentoVerificacion: string = this.form.controls['documento'].value;

    if (!this.registroMedico.blnInterno) {
      this.registroMedico.desDocumentoVerificacion = documentoVerificacion;

      const documentoEncontrado = this.lstDocumentos.find(
        x => x.desDocumentoVerificacion === documentoVerificacion
      );

      if (documentoEncontrado) {
        this.registroMedico.documentoVerif = documentoEncontrado;
      }

      this.registroMedico.blnPasaporte = documentoVerificacion === this.DOCUMENTO_PASAPORTE;
      // El caso CURP es implícito: si no es PASAPORTE, blnPasaporte debe ser false,
    }

    console.log("registroMedico es ", this.registroMedico);
    this.saveSession("registroMedico", this.registroMedico);
    void this._router.navigate(['publico/' + this._nav.registroMedico]);
  }


  public cambiaPerfil(): void {
    this.perfilSeleccionado();
    if (this.registroMedico.blnInterno) {
      this.camposResidente();
    } else {
      this.camposExterno();
    }
  }

  perfilSeleccionado() {

    this.registroMedico.perfil1 = this.form.controls['perfil'].value;
    let perfil = this.lstPerfil.find((x: { idPerfil: number; }) => x.idPerfil == this.registroMedico.perfil1);
    if (perfil) {
      this.registroMedico.perfil = perfil;
      this.registroMedico.blnInterno = perfil.nomPerfil.toLowerCase().trim() !== 'médico externo';
    }
  }

  private camposResidente() {
    this.clearCampos();
    this.blnResidente = true;
  }

  private camposExterno() {
    this.getCatalogoModalidad();
    this.getCatalogoDocumento();
    this.blnResidente = false;
    this.form.controls['modalidad'].setValidators([Validators.required]);
    this.form.controls['documento'].setValidators([Validators.required]);
    this.form.controls['modalidad'].updateValueAndValidity();
    this.form.controls['documento'].updateValueAndValidity();
  }

  private clearCampos() {
    this.form.controls['modalidad'].setValue(null);
    this.form.controls['modalidad'].setValidators([]);
    this.form.controls['documento'].setValidators([]);
    this.form.controls['modalidad'].updateValueAndValidity();
    this.form.controls['documento'].updateValueAndValidity();
  }

  cambiaModalidad() {
    this.registroMedico.modalidad = this.form.controls['modalidad'].value;
    console.log("hay cambios en el select ", this.registroMedico);
  }
}
