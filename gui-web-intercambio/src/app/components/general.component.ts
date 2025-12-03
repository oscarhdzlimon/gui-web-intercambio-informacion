import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Mensajes } from "@utils/mensajes";
import { Router } from '@angular/router';
import { NAV } from "@utils/url-global";
import { CatalogosGeneralesService } from "@services/catalogos-generales.service";
import { RegistroMedicoService } from "@services/registro-medico.service";
import { AlertService } from "@services/alert.service";
import { AuthService } from "@services/auth.service";
import { DocumentoService } from "@services/documentos.service";
import { SessionTimerService } from "@services/sesion-timer.service";
import { ConvocatoriaService } from "@services/convocatoria.service";

@Component({
  selector: 'app-general',
  //standalone: true,
  imports: [
    CommonModule,
  ],
  template: '',
})
export class GeneralComponent {

  _nav = NAV;
  protected _Mensajes: Mensajes;
  protected _router: Router;
  protected _alertServices: AlertService;

  protected authService = inject(AuthService);
  protected documentoService = inject(DocumentoService);
  /* SE COMENTA TIMER */
  /* protected sessionTimerService= inject(SessionTimerService); */


  constructor() {
    this._Mensajes = inject(Mensajes);
    this._router = inject(Router);
    this._alertServices = inject(AlertService);
    console.log("🟦 Constructor GeneralComponent");
    

    this.documentoService = inject(DocumentoService);
  }

  public onlyNumbers(event: any) {
    const pattern = /^\d*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replaceAll(/\D/g, '');
    }
  }

  public onlyAlphanumeric(event: any) {
    const pattern = /^[^0-9|A-Z]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replaceAll(/[^0-9|A-Z]/g, '');
    }
  }

  public convertMayusculas(event: any) {
    if (event.target.value) {
      event.target.value = event.target.value.toUpperCase();
    }
  }

  public convertMinusculas(event: any) {
    if (event.target.value) {
      event.target.value = event.target.value.toLowerCase();
    }
  }

  salir() { }


  irAHome() { }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get anioActual() {
    let hoy = new Date();
    return hoy.getFullYear();
  }





  public comparaCampos(texto1: string, texto2: string): boolean {
    let blnIguales = false;
    if (texto1 === texto2) {
      blnIguales = true;
    }

    return blnIguales;
  }
}
