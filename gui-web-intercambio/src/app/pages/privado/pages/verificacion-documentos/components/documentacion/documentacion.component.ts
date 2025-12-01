import {ConstanciasCursosComponent} from './../constancias-cursos/constancias-cursos.component';
import {Component, inject} from '@angular/core';
import {CardModule} from 'primeng/card';
import {TabsModule} from 'primeng/tabs';

import {DocsObligatoriosComponent} from '../docs-obligatorios/docs-obligatorios.component';
import {DocsEspecialidadComponent} from '../docs-especialidad/docs-especialidad.component';
import {CardInfoComponent} from '@pages/privado/pages/verificacion-documentos/components/card-info/card-info.component';
import {DetalleDocumentacion} from '@models/detalleDocumentacionAspirante.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {VerificacionDocsService} from '@services/verificacion-docs.service';

@Component({
  selector: 'app-documentacion',
  imports: [CardModule, TabsModule,
    DocsObligatoriosComponent, DocsEspecialidadComponent, ConstanciasCursosComponent,
    CardInfoComponent],
  templateUrl: './documentacion.component.html',
  styleUrl: './documentacion.component.scss'
})
export class DocumentacionComponent {
  tab: number = 0;
  idUsuario!: number;

  detalleAspirante!: DetalleDocumentacion;

  verificacionDocsService: VerificacionDocsService = inject(VerificacionDocsService);

  constructor(private readonly activatedRoute: ActivatedRoute) {
    this.obtenerInformacionDocumentos();
    this.idUsuario = this.activatedRoute.snapshot.paramMap.get('id') as unknown as number;
  }

  obtenerInformacionDocumentos(): void {
    this.activatedRoute.data.subscribe(({respuesta}) => {
      this.detalleAspirante = respuesta.respuesta;
    });
  }

  actualizarInformacionDocumentos(): void {
    this.verificacionDocsService.consultarPerfilDetalle(this.idUsuario).subscribe({
      next: (response) => {
        this.detalleAspirante = response.respuesta;
      },
      error: (error) => {}
    })
  }

  get estatus(): number {
    return this.detalleAspirante.participacion?.resultadoVerificacion?.estatusVerificacion?.idEstatusVerificacion;
  }
}
