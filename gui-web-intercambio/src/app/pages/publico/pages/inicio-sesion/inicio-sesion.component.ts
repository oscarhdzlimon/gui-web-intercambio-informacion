import {AfterViewInit, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {CommonModule} from '@angular/common';
import {GeneralComponent} from '@components/general.component';
import {passwordValidator} from '@validators/password-validator';
import {BloquearCaracterPasswordDirective} from '@directives/bloquear-caracter-password.directive';
import {PATRON_EMAIL} from '@utils/regex';
import {AuthService} from '@services/auth.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {HttpRespuesta} from '@models/http-respuesta.interface';
import {EmailAllowCaractersDirective} from '@directives/email-allow-caracters.directive';
import { Usuario } from '@models/usuario';
import { NAV } from '@utils/url-global';

declare var grecaptcha: any;

@Component({
  selector: 'app-inicio-sesion',
  imports: [
    Card,
    Button,
    InputTextModule,
    ReactiveFormsModule,
    CommonModule,
    BloquearCaracterPasswordDirective,
    RouterLink,
    EmailAllowCaractersDirective
  ],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.scss',
  standalone: true,
  
})
export class InicioSesionComponent extends GeneralComponent implements OnInit,AfterViewInit {
 captchaWidgetId: any;
  ngAfterViewInit(): void {
    
  }



  
  fb = inject(FormBuilder)
  destroyRef = inject(DestroyRef);

  activatedRoute = inject(ActivatedRoute);


  formLogin!: FormGroup;
  vista = signal('login');
  ingresoPass: boolean = false;

  caracteresProhibidos = new Set([' ', '"', '(', ')', '[', ']', '{', '}', '!', '#', '&', '/', ',', ';', ':', '<', '>']);

  fechaActual = new Date();


  ngOnInit(): void {
    this.formLogin = this.inicializarFormLogin();

  }

  inicializarFormLogin(): FormGroup {
    return this.fb.group({
      curp: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  iniciarSesion() {

    const curpControl = this.formLogin.get('curp') !=null? this.formLogin.get('curp')!.value : '';
   /*  if(curpControl == 'salj791014hmclps09'){
      this._alertServices.error('Sin coincidencias');

    }
    if(curpControl == 'salj791014hmclps08'){
      this._alertServices.alerta('La CURP no cuenta con un perfil asociado, favor de contactar al administrador del sistema.');

    }
    if(curpControl == 'salj791014hmclps07'){
      this._alertServices.alerta('CURP inactiva, favor de contactar al administrador del sistema.');

    } */
    let usuario = new Usuario();
    usuario.curp = curpControl;
    usuario.nombre = 'Juan';
    usuario.apellidoPaterno = 'Lopez';
    usuario.apellidoMaterno = 'Salazar';
    usuario.tipoUsuario = 'Operativo';
    usuario.sistema = 'SSC V1';
    usuario.modulo='Módulo Gestión'
    usuario.ooadmin = 'DF Sur';
    this.guardarUsuario(usuario);
    //void this._router.navigate(['/privado/consulta-antecedentes'], {relativeTo: this.activatedRoute,});
    this._router.navigate(['/privado', NAV.busquedasistema]);



    /* if (this.formLogin.invalid) {
      this._alertServices.alerta('Por favor, completa todos los campos obligatorios.');
      return;
    }
    this.authService.login(this.formLogin.value)
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (!respuesta.exito) {
            this._alertServices.alerta(respuesta.mensaje);
            return;
          }

          

          void this._router.navigate(['/privado/inicio'], {relativeTo: this.activatedRoute,});
        },
        error: (error) => {
          if (error.error.mensaje.includes('Usuario no encontrado con email')) {
            this._alertServices.error('El correo electrónico no está registrado. Verifica tu información o regístrate.');
            return;
          }
          if (error) {
            this._alertServices.error(error.error.mensaje);
          }
        }
      }) */
  }

  guardarUsuario(usuario: Usuario): void {
    try {
      const USUARIO_KEY = 'usuario_actual';
      // Serializar el objeto Usuario a una cadena JSON
      const usuarioJson = JSON.stringify(usuario);
      
      // Guardar la cadena JSON en sessionStorage
      sessionStorage.setItem(USUARIO_KEY, usuarioJson);
      
    } catch (error) {
      console.error('Error al guardar el usuario en sesión:', error);
    }
  }

  validarCaracterCorreo(event: KeyboardEvent) {
    if (this.caracteresProhibidos.has(event.key)) {
      this._alertServices.alerta(this._Mensajes.MSG002);
      event.preventDefault();
    }
  }

  validarEstructuraCorreo(event: any) {
    if (!PATRON_EMAIL.test(event.target.value)) {
      this._alertServices.alerta(this._Mensajes.MSG003);
    }
  }

  get f() {
    return this.formLogin.controls;
  }

  crearCuenta() {
    this._router.navigate(['publico/' + this._nav.crearCuenta])
  }
}
