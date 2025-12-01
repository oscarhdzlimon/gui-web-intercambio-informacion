import {Component, HostListener, inject, OnInit} from '@angular/core';
import {Avatar} from 'primeng/avatar';
import {GeneralComponent} from '../general.component';
import {SesionUser} from '@models/sesion-user.interface';
import {UserService} from '@services/user.service';
import {SpeedDial} from 'primeng/speeddial';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ClickService } from '@services/click.service';
import { Usuario } from '@models/usuario';

@Component({
  selector: 'app-menu',
  imports: [
    Avatar,
    SpeedDial,
    PrimeTemplate,
    ButtonModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent extends GeneralComponent implements OnInit {

  clickService = inject(ClickService);
  userService = inject(UserService);
  userData: SesionUser | null = null;

  speedDialVisible: boolean = false;

  items: MenuItem[] = [];

  usuario:Usuario= new Usuario();

  private readonly MOBILE_BREAKPOINT = 768;

  isMobileView: boolean = false;

  ngOnInit() {
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
    this.usuario = this.obtenerUsuario()!;
  }

  obtenerUsuario(): Usuario | null {
    try {
      const USUARIO_KEY = 'usuario_actual';
      // 1. Obtener la cadena JSON de sessionStorage
      const usuarioJson = sessionStorage.getItem(USUARIO_KEY);
      
      if (usuarioJson) {
        // 2. Deserializar la cadena JSON de vuelta al tipo Usuario
        // Usamos 'as Usuario' para forzar el tipado
        return JSON.parse(usuarioJson) as Usuario; 
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

  emitirClick(){
    this.clickService.emitirClick();
  }

}
