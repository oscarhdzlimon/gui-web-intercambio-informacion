import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {PATRON_CURP} from '@utils/regex';
import {AlphanumericDirective} from '@directives/only-alphanumeric.directive';
import {EmailAllowCaractersDirective} from '@directives/email-allow-caracters.directive';
import {NgClass} from '@angular/common';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {Card} from 'primeng/card';
import {SolicitudCambioContrasenia} from '@models/solicitud-cambio-contrasenia.interface';
import {AlertService} from '@services/alert.service';
import {Mensajes} from '@utils/mensajes';
import {Router} from '@angular/router';
import {RecuperacionCredencialesService} from '@services/recuperacion-credenciales.service';
import {BtnRegresarComponent} from '@components/btn-regresar/btn-regresar.component';

@Component({
  selector: 'app-recuperar-cuenta',
  imports: [
    Button,
    InputTextModule,
    ReactiveFormsModule,
    AlphanumericDirective,
    EmailAllowCaractersDirective,
    NgClass,
    ConfirmDialog,
    Card,
    BtnRegresarComponent
  ],
  templateUrl: './recuperar-cuenta.component.html',
  styleUrl: './recuperar-cuenta.component.scss',
  providers: [ConfirmationService]
})
export class RecuperarCuentaComponent {
  mensajes: Mensajes = new Mensajes();
  formRecuperarCuenta!: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  authService: RecuperacionCredencialesService = inject(RecuperacionCredencialesService);
  alertaService: AlertService = inject(AlertService);

  private readonly router = inject(Router);

  constructor(private readonly confirmationService: ConfirmationService) {
    this.formRecuperarCuenta = this.inicializarFormulario();
  }

  inicializarFormulario(): FormGroup {
    return this.fb.group({
      curp: ['', [Validators.required, Validators.minLength(18),
        Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      correoPersonal: ['', [Validators.required, Validators.email]]
    });
  }

  abrirModalRecuperarContrasenia() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea cambiar su contraseña?',
      icon: 'pi pi-exclamation-circle',
      acceptButtonProps: {
        label: 'Sí',
      },
      rejectButtonProps: {
        label: 'No',
        severity: 'danger'
      },
      accept: () => this.recuperarContrasenia(),
      reject: () => {
      }
    });
  }

  recuperarContrasenia(): void {
    if (this.formRecuperarCuenta.invalid) return;
    const solicitud: SolicitudCambioContrasenia = this.generarSolicitudRecuperacionContrasenia();
    this.authService.solicitarCambioPass(solicitud).subscribe({
      next: (respuesta) => {
        this.alertaService.exito(this.mensajes.MSG017);
        setTimeout(() => {
          void this.router.navigate(['/iniciar-sesion']);
        }, 2000)
      },
      error: (error) => {
        if (error.error.mensaje === 'Usuario no encontrado.') {
          this.alertaService.error(this.mensajes.MSG018);
          return;
        }
        if (!error.error.mensaje) {
          this.alertaService.error('Ocurrió un error, por favor intente más tarde.');
          return;
        }
        this.alertaService.error(error.error.mensaje);
      },
    });
  }

  generarSolicitudRecuperacionContrasenia(): SolicitudCambioContrasenia {
    return {
      refCurp: this.formRecuperarCuenta.get('curp')?.value,
      refEmail: this.formRecuperarCuenta.get('correoPersonal')?.value
    }
  }

  get f() {
    return this.formRecuperarCuenta.controls;
  }


}
