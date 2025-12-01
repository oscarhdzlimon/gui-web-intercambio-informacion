import {Component, inject} from '@angular/core';
import {Card} from 'primeng/card';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Password} from 'primeng/password';
import {Divider} from 'primeng/divider';
import {PrimeTemplate} from 'primeng/api';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AlertService} from '@services/alert.service';
import {CambioContrasenia} from '@models/cambio-contrasenia.interface';
import {Mensajes} from '@utils/mensajes';
import {Button} from 'primeng/button';
import {RecuperacionCredencialesService} from '@services/recuperacion-credenciales.service';

@Component({
  selector: 'app-cambio-contrasenia',
  imports: [
    Card,
    FormsModule,
    ReactiveFormsModule,
    Password,
    Divider,
    PrimeTemplate,
    Button,
    RouterLink
  ],
  templateUrl: './cambio-contrasenia.component.html',
  styleUrl: './cambio-contrasenia.component.scss'
})
export class CambioContraseniaComponent {
  mensajes: Mensajes = new Mensajes();
  registroForm!: FormGroup;
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  alertaService: AlertService = inject(AlertService);
  authService: RecuperacionCredencialesService = inject(RecuperacionCredencialesService);

  fb: FormBuilder = inject(FormBuilder);

  solicitarNuevoCodigo: boolean = false;

  REGEX_PASS: RegExp = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,12}$/;

  constructor() {
    this.registroForm = this.crearRegistroForm();
  }

  crearRegistroForm(): FormGroup {
    return this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8),
        Validators.maxLength(16), Validators.pattern(this.REGEX_PASS)]],
      confirmarContrasena: ['', [Validators.required, Validators.minLength(8),
        Validators.maxLength(16), Validators.pattern(this.REGEX_PASS)]]
    });
  }

  cambiarPassword(): void {
    if (this.registroForm.invalid) return;
    if (!this.validarMismoPass()) {
      this.alertaService.alerta('Las contraseñas no coinciden, favor de verificar.');
      return;
    }
    const solicitud: CambioContrasenia = this.crearSolicitudCambioPass();
    const token = this.route.snapshot.queryParams['token'];
    this.authService.cambiarPass(solicitud, token).subscribe({
        next: (response) => {
          if(response.exito){
              this.manejarCambioPassCorrecto()
          } else {
            this.alertaService.error(response.mensaje)
          }

        },
        error: (error) => {
          console.log(error);
          this.manejarValidarCodigoError(error.error)
        }
      }
    );
  }

  crearSolicitudCambioPass(): CambioContrasenia {
    return {
      nuevaContrasena: this.registroForm.get('nuevaContrasena')?.value,
    }
  }

  manejarCambioPassCorrecto(): void {
    this.alertaService.exito(this.mensajes.MSG062);
    setTimeout(() => {
      void this.router.navigate(['/iniciar-sesion']);
    }, 2000)
  }

  manejarValidarCodigoError(error: any): void {
    console.log(error.mensaje)
    if (error.mensaje === 'El Token ha expirado.') {
      this.alertaService.error(this.mensajes.MSG063);
      this.solicitarNuevoCodigo = true;
      return;
    }
    if (!error.mensaje) {
      this.alertaService.error('Ocurrió un error, por favor intente más tarde.');
      return;
    }
    this.alertaService.error(error.mensaje);
  }

  validarMismoPass(): boolean {
    const nuevaContrasena = this.registroForm.get('nuevaContrasena');
    const confirmarContrasena = this.registroForm.get('confirmarContrasena');
    return nuevaContrasena?.value === confirmarContrasena?.value;
  }

  get f() {
    return this.registroForm.controls;
  }

}
