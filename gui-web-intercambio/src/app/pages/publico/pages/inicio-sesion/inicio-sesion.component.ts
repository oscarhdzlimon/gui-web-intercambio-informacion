import {AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {CommonModule} from '@angular/common';
import {GeneralComponent} from '@components/general.component';
import {BloquearCaracterPasswordDirective} from '@directives/bloquear-caracter-password.directive';
import {HttpRespuesta} from '@models/http-respuesta.interface';
import {NAV} from '@utils/url-global';

declare var grecaptcha: any;

@Component({
  selector: 'app-inicio-sesion',
  imports: [
    Card,
    Button,
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    BloquearCaracterPasswordDirective
  ],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.scss',
  standalone: true,

})
export class InicioSesionComponent extends GeneralComponent implements OnInit,AfterViewInit {

  @ViewChild('captchaContainer') captchaContainer!: ElementRef;

  captchaToken = signal<string | null>(null);
  SITE_KEY = '6Le2a1QsAAAAAJ2kSfr819zD6AzH_O86G6z5O1AY';

  fb = inject(FormBuilder)
  formLogin!: FormGroup;
  ingresoPass: boolean = false;

  ngOnInit(): void {
    this.formLogin = this.inicializarFormLogin();
  }

  ngAfterViewInit(): void {
    this.renderizarCaptcha();
  }

  renderizarCaptcha() {
    const recaptcha = (window as any)['grecaptcha']; // Acceso seguro
    if (recaptcha && recaptcha.render) {
      recaptcha.render(this.captchaContainer.nativeElement, {
        'sitekey': this.SITE_KEY,
        'callback': (response: string) => this.captchaToken.set(response)
      });
    }
  }

  inicializarFormLogin(): FormGroup {
    return this.fb.group({
      refCurp: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  iniciarSesion() {
    if (this.formLogin.invalid) {
      this._alertServices.alerta('Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (!this.captchaToken()) {
      this._alertServices.alerta('Por favor, verifica que no eres un robot.');
      return;
    }
    this.authService.login(this.formLogin.value)
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (!respuesta.exito) {
            this._alertServices.alerta(respuesta.mensaje);
            return;
          }

          void this._router.navigate(['/privado', NAV.consultaantecedentes]);
        },
        error: (error) => {
          grecaptcha.reset();
          this.captchaToken.set(null);
          if (error.error.mensaje.includes('Usuario no encontrado con email')) {
            this._alertServices.error('El correo electrónico no está registrado. Verifica tu información o regístrate.');
            return;
          }
          if (error) {
            this._alertServices.error(error.error.mensaje);
          }
        }
      })
  }

  get f() {
    return this.formLogin.controls;
  }
}
