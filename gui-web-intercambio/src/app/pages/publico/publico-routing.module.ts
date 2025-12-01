import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InicioSesionComponent} from '@publico/inicio-sesion/inicio-sesion.component';
import {CrearCuentaComponent} from '@publico/crear-cuenta/crear-cuenta.component';
import {NAV} from '@utils/url-global';
import {RegistroMedicoComponent} from './pages/registro-medico/registro-medico.component';
import {RecuperarCuentaComponent} from '@publico/recuperar-cuenta/recuperar-cuenta.component';
import {CambioContraseniaComponent} from '@publico/cambio-contrasenia/cambio-contrasenia.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: NAV.inicioSesion,
    pathMatch: 'full',
  },
  {
    path: NAV.inicioSesion,
    component: InicioSesionComponent,
  },
  {
    path: NAV.crearCuenta,
    component: CrearCuentaComponent,
  },
  {
    path: NAV.registroMedico,
    component: RegistroMedicoComponent,
  },
  {
    path: NAV.recuperarContrasenia,
    component: RecuperarCuentaComponent
  },
  {
    path: NAV.nuevaContrasenia,
    component: CambioContraseniaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicoRoutingModule {
}
