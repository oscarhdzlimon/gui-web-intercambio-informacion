import {Component, HostListener, inject, OnInit} from '@angular/core';
import {GeneralComponent} from '../general.component';
import {SesionUser} from '@models/sesion-user.interface';
import {UserService} from '@services/user.service';
import {SpeedDial} from 'primeng/speeddial';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {ClickService} from '@services/click.service';
import {Usuario} from '@models/usuario';
import {ActivatedRoute, Router} from '@angular/router';
import {CryptoService} from '@services/crypto.service';
import {NombreModuloPipe} from '@pipes/nombre-modulo.pipe';
import {NombreSistemaPipe} from '@pipes/nombre-sistema.pipe';
import {TitleCasePipe} from '@angular/common';
import { UsuarioSesion } from '@models/usuarioSesion';

@Component({
  selector: 'app-menu',
  imports: [
    SpeedDial,
    PrimeTemplate,
    ButtonModule,
    NombreModuloPipe,
    NombreSistemaPipe,
    TitleCasePipe
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent extends GeneralComponent implements OnInit {

  readonly AES_KEY_BASE64: string = "mZzG9Fz9P0n4z7mZlKz8B9nX0mJ8vF7PZKX2vZx5QmE=";

  clickService = inject(ClickService);
  userService = inject(UserService);

  userData: SesionUser | null = null;

  perfil!: string;

  speedDialVisible: boolean = false;

  items: MenuItem[] = [];

  usuario: Usuario = new Usuario();

  private readonly catalogoOoadUmaeUrl = 'assets/catalogo-ooad-umae.json';

  private readonly MOBILE_BREAKPOINT = 768;

  isMobileView: boolean = false;

  constructor(private readonly route: ActivatedRoute,
              private readonly cifrarServicio: CryptoService,
            public router: Router) {
    super();
  }

  ngOnInit() {
    this.leerInformacionUsuario();
    this.checkScreenSize();
    this.items = [
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: (event: any) => {
          this.cerrarSesion(event)
        },
      }
    ]

    if (!this.usuario.nombreCompleto) {
      this.userService.userData$.subscribe(user => this.userData = user);
      this.usuario.nombreCompleto = this.userData?.nombreCompleto as string;
      this.usuario.sistema = this.userData?.sistemaOrigen as string;
      this.usuario.modulo = this.userData?.modulo as string;
      this.usuario.ooadmin = this.userData?.ooad as string;
      this.cargarDescripcionOoadUmae(this.usuario.ooadmin);
    }
  }

  leerInformacionUsuario() {
    this.route.queryParamMap.subscribe(async params => {

      if (!params) return;
      const dataCifrada: string | null = params.get('valor');
      if (!dataCifrada)
      {

        //acceso por sesion
       const infoUsuario =  this.obtenerUsuario();
        this.usuario.nombreCompleto = infoUsuario?.nombreCompleto ?? "";
        this.usuario.sistema = infoUsuario?.sistemaOrigen ?? "";
        this.usuario.modulo = infoUsuario?.modulo ?? "";
        this.usuario.ooadmin = infoUsuario?.ooad ?? "";
        this.cargarDescripcionOoadUmae(this.usuario.ooadmin);
        return;
      }

      try {
        const resultado = await this.cifrarServicio.decryptToObject<any>(
          dataCifrada,
          this.AES_KEY_BASE64
        );

        // Mapeamos los campos del objeto descifrado a tu objeto 'usuario'
        // Adaptando los nombres de la interfaz a lo que tu menú necesita
        this.usuario.nombreCompleto = resultado.usuarioLogueado;
        this.usuario.sistema = resultado.sistema;
        this.usuario.modulo = resultado.modulo;
        this.usuario.ooadmin = resultado.ooad_UMAE;
        this.cargarDescripcionOoadUmae(this.usuario.ooadmin);
        this.perfil = resultado.perfil ?? 'Sin Perfil Asignado';
        // Si necesitas la lista de personas o el expediente, ya los tienes aquí:
        // this.listaPersonas = resultado.personas;

      } catch (error) {
        console.error("Error al procesar la información de seguridad:", error);
        // Aquí podrías redirigir a una página de error o login
      }
    });
  }

  private cargarDescripcionOoadUmae(idOoadUmae: string | null | undefined): void {
    const id = String(idOoadUmae ?? '').trim();
    if (!id) return;

    fetch(this.catalogoOoadUmaeUrl)
      .then(response => response.ok ? response.json() : Promise.reject(response.status))
      .then((catalogo: Array<{ id: string; descripcion: string }>) => {
        const registro = catalogo.find(item => String(item.id).trim() === id);
        if (registro) this.usuario.ooadmin = registro.descripcion;
      })
      .catch(error => console.error('Error al cargar catalogo OOAD/UMAE:', error));
  }

  obtenerUsuario(): UsuarioSesion | null {

    try {

      const token = localStorage.getItem('token') ?? "";
      // 1. Obtener la cadena JSON de sessionStorage
      const usuarioJson =  this.authService.obtenerUsuarioDePayload(token);

      if (usuarioJson) {
        // 2. Deserializar la cadena JSON de vuelta al tipo Usuario
        // Usamos 'as Usuario' para forzar el tipado
        return usuarioJson as UsuarioSesion;
      }
      return null;

    } catch (error) {
      console.error('Error al recuperar el usuario de sesión:', error);
      return null;
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < this.MOBILE_BREAKPOINT;
  }


  cerrarSesion(event: any) {
    if (!event) return;
    this.authService.cerrarSesion();
  }

  emitirClick() {
    this.clickService.emitirClick();
  }


  get mostrarBoton(): boolean {
    const ruta = this.router.url;
    return !ruta.includes('privado/busqueda-sistema');
  }

}
