import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import Aura from '@primeng/themes/aura';
import {es} from "primelocale/es.json"
import {routes} from './app.routes';
import {providePrimeNG} from 'primeng/config';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {Mensajes} from '@utils/mensajes';
import {ApiKeyInterceptor} from '@interceptors/api-key.interceptor';

import {LoadingInterceptor} from '@interceptors/loader-interceptor.service';
import {provideUserIdleConfig} from "angular-user-idle";
import {TIEMPO_MAXIMO_SESION} from '@utils/tokens';
import {TiempoSesion} from '@models/tiempo-sesion.interface';

export const appConfig: ApplicationConfig = {
  providers: [Mensajes,
    provideZoneChangeDetection({eventCoalescing: true}),
    {
      provide: TIEMPO_MAXIMO_SESION,
      useValue: {
        tiempoMaximoInactividad: 1200,
        mostrarAlertaCuandoFalten: 60,
      } as TiempoSesion,
    },
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    providePrimeNG(
      {
        theme: {
          preset: Aura, options: {
            darkModeSelector: 'none',
            cssLayer: {
              name: 'primeng-base',
              order: 'framework, primeng-base, app-components, app-overrides'
            }
          }
        }, translation: es,
      }
    ),
    /* {provide: HTTP_INTERCEPTORS, useClass: ApiKeyInterceptor, multi: true},
    
    {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true}, */
    provideAnimations(),
    provideUserIdleConfig({idle: 1140, timeout: 60, ping: 120}),
  ]
};
