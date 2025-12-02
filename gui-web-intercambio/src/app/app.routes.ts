import {Routes} from '@angular/router';



export const routes: Routes = [
  {
    path: '',
    redirectTo: 'publico',
    pathMatch: 'full',
  },
  {
    path: 'publico',
    loadChildren: () => import('./pages/publico/publico.module').then(m => m.PublicoModule),

  },
  {
    path: 'privado',
    loadChildren: () => import('./pages/privado/privado.module').then(m => m.PrivadoModule),
   
  },
  {
    path: '**',
    redirectTo: 'publico',
    pathMatch: 'full'
  }
];
