import {JwtHelperService} from "@auth0/angular-jwt";
import {UserService} from './user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {Payload} from '@models/payload.interface';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Inject, inject, Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import {Login} from '@models/login';
import {BehaviorSubject, map, Observable, of, Subject, tap} from 'rxjs';
import {CME_TOKEN} from '@utils/constants';
import {UserIdleService} from 'angular-user-idle';
import {TIEMPO_MAXIMO_SESION} from '@utils/tokens';
import {TiempoSesion} from '@models/tiempo-sesion.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly URL_BASE: string = environment.api.login + 'auth/';
  private readonly URL_AUTH: string = 'authenticate';
  private readonly URL_CAMBIO_CONTRASENIA: string = 'solicitud-cambio-contrasena';
  private readonly URL_ACTUALIZAR_CONTRASENIA: string = 'cambio-contrasena';
  private mostrarAlertaSesionInactivaSubject = new Subject<boolean>();
  mostrarAlertaSesionInactivaS: Observable<boolean> = this.mostrarAlertaSesionInactivaSubject.asObservable();

  private readonly usuarioSesionSubject = new BehaviorSubject<SesionUser | null>(null);

  http = inject(HttpClient);
  router = inject(Router);
  usuarioService = inject(UserService);

  get usuarioSesion() {
    return this.usuarioSesionSubject.value;
  }

  existeUnaSesion$: Observable<boolean> = this.usuarioService.userData$
    .pipe(map((usuario: SesionUser | null) => !!usuario));


  constructor(private userIdleService: UserIdleService,
              @Inject(TIEMPO_MAXIMO_SESION) private tiempoSesion: TiempoSesion) {
   // this.recuperarSesionAlRecargarPagina()
  }

  login(login: Login): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}${this.URL_AUTH}`, login).pipe(
      tap((respuesta: any) => {
        if (respuesta.exito) {
          localStorage.setItem(CME_TOKEN, respuesta.respuesta.token);
          this.settearSession(respuesta.respuesta.token);

        }
      })
    );
  }

  recuperarSesionAlRecargarPagina() {
    const token: string | null = localStorage.getItem(CME_TOKEN);
    if (token) {
      this.settearSession(token);
    } else {
      if(this.router.url != "/publico/crear-cuenta")this.cerrarSesion();
    }
  }

  settearSession(token: string) {
    this.agregarUsuarioSesion(token);
    this.usuarioService.setUser(this.obtenerUsuarioDePayload(token));
    this.iniciarTemporizadorSesion();
  }

  private agregarUsuarioSesion(accessToken: string): void {
    const usuarioSesion: SesionUser = this.obtenerUsuarioDePayload(accessToken);
    this.usuarioSesionSubject.next(usuarioSesion);
  }

  obtenerUsuarioDePayload(token: string): SesionUser | never {
    let payload: any | null = new JwtHelperService().decodeToken<Payload>(token);
    if (payload) {
      return {
        idPerfil: payload.idPerfil,
        idUsuario: payload.idUsuario,
        nomApellidoPaterno: payload.nomApellidoPaterno,
        nomNombre: payload.nomNombre,
        nomApellidoMaterno: payload.nomApellidoMaterno,
        cveMatricula: payload?.cveMatricula,
        perfil: payload.perfil,
        refCurp: payload.refCurp,
        refEmail: payload.refEmail,
        sub: payload.sub,
        idSubperfil: payload.idSubperfil,
        subperfil: payload.subperfil,
        fechaRegistro: payload.fechaRegistro,
        refPasaporte: payload.refPasaporte,
        refFolio: payload?.refFolio
      };
    } else {
      throw new Error('Error al intentar obtener el usuario del payload en el token');
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.usuarioService.clearUser();
    this.usuarioSesionSubject.next(null);
    this.detenerTemporizadorSesion();
    void this.router.navigate(['/']);
  }

  checkAuthStatus(): Observable<boolean> {
    const token: string | null = localStorage.getItem(CME_TOKEN);

    if (!token) {
      this.cerrarSesion();
      return of(false);
    }

    const jwtHelper = new JwtHelperService();
    if (jwtHelper.isTokenExpired(token)) {
      this.cerrarSesion();
      return of(false);
    }

    if (!this.usuarioSesion) {
      this.settearSession(token);
    }

    return of(true);
  }


  iniciarTemporizadorSesion(): void {
    this.userIdleService.startWatching(); // Inicia el temporizador de inactividad
    this.userIdleService.onTimerStart().subscribe(count => {
      if (count === this.tiempoSesion.mostrarAlertaCuandoFalten / 60) {
        this.mostrarAlertaSesionInactivaSubject.next(true); // Muestra la alerta
      }
    });
    this.userIdleService.onTimeout().subscribe(() => this.cerrarSesion());
  }

  resetearTemporizadorSesion(): void {
    this.userIdleService.resetTimer(); // Reinicia el temporizador
    this.mostrarAlertaSesionInactivaSubject.next(false); // Oculta la alerta
  }

  detenerTemporizadorSesion(): void {
    this.userIdleService.stopWatching(); // Detiene el temporizador
  }

}
