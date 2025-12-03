import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InicioComponent} from '@privado/inicio/inicio.component';
import {PrivadoComponent} from '@pages/privado/privado.component';
import {inicioResolver} from '../../core/resolvers/inicio.resolver';
import {ofertaLaboralResolver} from '../../core/resolvers/oferta-laboral.resolver';
import {VerificacionDocumentosComponent} from './pages/verificacion-documentos/verificacion-documentos.component';
import {DocumentacionComponent} from './pages/verificacion-documentos/components/documentacion/documentacion.component';
import {NAV} from '@utils/url-global';

import {documentacionAspiranteResolver} from '../../core/resolvers/documentacion-aspirante.resolver';
import { verficacionDocsResolver } from '../../core/resolvers/verificacion-docs.resolver';
import { OfertaLaboralComponent } from './pages/oferta-laboral/oferta-laboral.component';
import { ConsultaAntecedentesComponent } from './pages/consulta-antecedentes/consulta-antecedentes.component';
import { DetalleAntecedentesComponent } from './pages/detalle-antecedentes/detalle-antecedentes.component';
import { BusquedaSistemasComponent } from './pages/busqueda-sistemas/busqueda-sistemas.component';

const routes: Routes = [{
  path: '',
  component: PrivadoComponent,
  children: [
    {
      path: '',
      redirectTo: NAV.home,
      pathMatch: 'full',
    },
    {
      path: NAV.home,
      component: InicioComponent,
      resolve: {
        respuesta: inicioResolver,
        respuesta_oferta: ofertaLaboralResolver,
      },
   
    },
    {
      path: NAV.verificacionDocumentos,
      component: VerificacionDocumentosComponent,
    
      resolve:{
        respuesta: verficacionDocsResolver
      }
    },
    {
      path: NAV.consultaantecedentes,
      component: ConsultaAntecedentesComponent,
      
    },
    {
      path: NAV.busquedasistema,
      component: BusquedaSistemasComponent,

      
    },
    {
      path: NAV.documentacionAspirante,
      component: DocumentacionComponent,
      resolve: {
        respuesta: documentacionAspiranteResolver,
      }
    },

    {
      path: NAV.ofertaLaboral,
      component: OfertaLaboralComponent,
      resolve: {
        respuesta_oferta: ofertaLaboralResolver
      }

    },

    {
      path: NAV.detalleAntecedentes,
      component: DetalleAntecedentesComponent,
 
      
    },


  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivadoRoutingModule {
}
