import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TableModule } from 'primeng/table';
import { Popover, PopoverModule } from 'primeng/popover';
import { GeneralComponent } from '../../../../components/general.component';
import { TipoDropdown } from '@models/tipo-dropdown.interface';
import { ButtonModule } from 'primeng/button';
import { DUMMIE_TABLA_VERIFICACION_DOCUMENTOS } from '@utils/dummies';
import { mapearArregloTipoDropdown } from '@utils/funciones';
import { VerificacionDocsService } from '@services/verificacion-docs.service';
import { VerificacionDocsInterface } from '@models/verificacion-docs.interface';
import { HttpRespuesta } from '@models/http-respuesta.interface';
import { TablaVerificacionDocsInterface } from '@models/tabla-verificacion-docs.interface';
import { VerificacionDocsExcelInterface } from '@models/verificacion-docs-excel.interface';
import { saveAs } from 'file-saver';
import { DictamenRespuesta } from '@models/dictamen-respuesta.interface';
import { AdjuntoOpinion, OpinionTecnicaRespuesta } from '@models/opnion-tecnia-respuesta.interface';
import { AlertService } from '@services/alert.service';


@Component({
  selector: 'app-verificacion-documentos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    SelectModule,
    InputText,
    TableModule,
    ButtonModule,
    ConfirmPopupModule,
    PaginatorModule,
    PopoverModule
  ],
  templateUrl: './verificacion-documentos.component.html',
  styleUrl: './verificacion-documentos.component.scss',
})
export class VerificacionDocumentosComponent extends GeneralComponent implements OnInit {
  @ViewChild('op') op!: Popover;

  dummies = [{ label: 'Dummie 1', value: 'Dummie 1' }, { label: 'Dummie 2', value: 'Dummie 2' }];
  dummiesTabla = DUMMIE_TABLA_VERIFICACION_DOCUMENTOS;

  verificacionDocsService = inject(VerificacionDocsService);
  alertaService: AlertService = inject(AlertService);


  filtroForm!: FormGroup;

  usuarioDocumentos: WritableSignal<TablaVerificacionDocsInterface[]> = signal([]);
  documentoSeleccionado: any;
  paginaActual: number = 0;
  first: number = 0;
  totalElementos: number = 0;
  rows: number = 10;

  especialidad: TipoDropdown[] = [];
  estatus: TipoDropdown[] = [];

  clases: Map<number, string> = new Map([
    [1, 'pendiente'],
    [2, 'revision'],
    [3, 'cumple'],
    [4, 'noCumple']
  ]);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly fb: FormBuilder) {
    super();
    this.filtroForm = this.inicializarForm();
    this.obtenerCatalogos();
  }

  ngOnInit(): void {
    this.paginar();
  }

  obtenerCatalogos() {
    this.activatedRoute.data.subscribe(({ respuesta }) => {
      const [especialidades, estatusVerificacion] = respuesta;
      this.especialidad = mapearArregloTipoDropdown(especialidades, 'desEspecialidad', 'cveEspecialidad');
      this.estatus = mapearArregloTipoDropdown(estatusVerificacion.respuesta, 'desEstatus', 'idEstatusVerificacion');
    });
  }

  inicializarForm(): FormGroup {
    return this.fb.group({
      especialidad: [],
      estatus: [],
      matricula: [],
    });
  }

  textoEstatus(estatus: number): string {
    const tipoEstatus: string[] = [
      "No cumple con requisitos",
      "Cumple con requisitos",
      "Revisión documental",
      "Pendiente"
    ];


    return tipoEstatus[estatus];
  }

  settearClase(estatus: number): string {
    return this.clases.get(estatus) ?? '';
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.paginaActual = event.page;
    this.paginar();
  }

  paginar() {
    this.verificacionDocsService.consultarDocs(this.filtros()).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.usuarioDocumentos.set(respuesta.respuesta['content']);

        //this.first: number = 0;
        this.totalElementos = respuesta.respuesta.page.totalElements;
      }
    })
  }

  descargarExcelHistoricoDocs() {
    this.verificacionDocsService.descargaExcelHistoricoDocs(this.filtrosExcel()).subscribe({


      next: (excelBlob: Blob) => {

        const nombreArchivo = 'DATOS_VERIFICACION_DOCUMENTOS.xlsx';


        saveAs(excelBlob, nombreArchivo);


      },
      error: (error) => {
        console.error('Error al descargar el Excel:', error);
        this.alertaService.error('Error al descargar el Excel');

      }
    });
  }


  filtros(): VerificacionDocsInterface {
    return {
      page: this.paginaActual,
      size: this.rows,
      idEstatus: (this.filtroForm.get('estatus')?.value)?.value,
      cveEspecialidad: (this.filtroForm.get('especialidad')?.value)?.value,
      matriculaFolio: this.filtroForm.get('matricula')?.value,

    }
  }

  filtrosExcel(): VerificacionDocsExcelInterface {
    return {
      idEstatus: (this.filtroForm.get('estatus')?.value)?.value,
      cveEspecialidad: (this.filtroForm.get('especialidad')?.value)?.value,
      matriculaFolio: this.filtroForm.get('matricula')?.value,

    }
  }


  consultaDocumento(event: any, documento: any) {
    if (this.documentoSeleccionado?.matricula === documento.matricula) {
      this.op.hide();
      this.documentoSeleccionado = null;
    } else {
      this.documentoSeleccionado = documento;
      this.op.show(event);

      if (this.op.container) {
        this.op.align();
      }
    }
  }

  imprimirDocumento(usuario: TablaVerificacionDocsInterface) {

    if (usuario.idTipoConvocatoria == 1) {
      this.descargaDictamen(usuario.idUsuario);
    }
    else {
      this.descargaOpinion(usuario.idUsuario);
    }
  }



  descargaOpinion(idUsuario: number) {
    this.verificacionDocsService.descargarOpinion(idUsuario).subscribe({
      next: (respuesta: OpinionTecnicaRespuesta) => {


        if (respuesta.exito && respuesta.respuesta && respuesta.respuesta.length > 0) {


          respuesta.respuesta.forEach((adjunto: AdjuntoOpinion) => {

            if (adjunto.adjuntoBase64) {

              const base64Data = adjunto.adjuntoBase64;
              const contentType = 'application/pdf';


              const pdfBlob = this.b64toBlob(base64Data, contentType);


              const pdfUrl = URL.createObjectURL(pdfBlob);

              // 5. Abrir la URL en una nueva ventana/pestaña
              // Nota: El navegador puede bloquear la apertura de múltiples ventanas si no es en respuesta directa a una acción del usuario.
              window.open(pdfUrl, '_blank');


            }
          });

        } else {
          // Manejar el caso donde 'exito' es false o no hay adjuntos
          const mensaje = respuesta.mensaje || 'No se encontraron opiniones técnicas para descargar.';
          this.alertaService.error('Error al imprimir los documentos');
          console.error('Error o falta de datos:', mensaje);
          // Mostrar notificación al usuario.
        }
      },
      error: (error) => {
        // Manejar errores de conexión o HTTP
        this.alertaService.error('Error al imprimir los documentos');
        console.error('Error de conexión o HTTP al obtener las opiniones:', error);
      }
    });
  }

  descargaDictamen(idUsuario: number) {
    this.verificacionDocsService.descargarDictamen(idUsuario).subscribe({
      next: (respuesta: DictamenRespuesta) => {


        if (respuesta.exito) {

          const adjunto = respuesta.respuesta;

          if (adjunto && adjunto.adjuntoBase64) {

            const base64Data = adjunto.adjuntoBase64;
            const nombreArchivo = adjunto.nombreAdjunto || 'dictamen.pdf';
            const contentType = 'application/pdf';


            const pdfBlob = this.b64toBlob(base64Data, contentType);


            const pdfUrl = URL.createObjectURL(pdfBlob);


            window.open(pdfUrl, '_blank');



          } else {
            console.error('Error: El JSON es exitoso pero falta el Base64 del PDF.');

          }

        } else {
          // El backend indicó que la operación falló (exito: false)
          this.alertaService.error('Error al imprimir los documentos');
          console.error('Error del servicio:', respuesta.mensaje);
          // Mostrar notificación al usuario con el mensaje del backend
        }
      },
      error: (error) => {
        // Manejar errores de conexión o HTTP
        this.alertaService.error('Error al imprimir los documentos');
        console.error('Error de conexión o HTTP al obtener el dictamen:', error);
        // Mostrar notificación de error genérico.
      }
    });
  }

  private b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512): Blob {


    let base64 = b64Data.split(',')[1] ? b64Data.split(',')[1] : b64Data;


    // Eliminar CUALQUIER carácter que NO sea una letra/número válido para Base64, 
    // incluyendo espacios, saltos de línea, y caracteres de control.
    // Base64 válido solo incluye A-Z, a-z, 0-9, +, / y = (relleno).
    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');

    // 3. Decodificar el Base64
    try {
      const byteCharacters = atob(base64);

      const byteArrays: Uint8Array[] = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays as BlobPart[], { type: contentType });

    } catch (e) {
      // Si incluso después de la limpieza falla, la respuesta NO es Base64.
      console.error("Error crítico: La respuesta HTTP no es un Base64 válido.", e);
      // Lanza un error genérico o notifica al usuario.
      throw new Error("El string Base64 no es válido o contiene caracteres ilegales.");
    }
  }

  hidePopover() {
    this.op.hide();
  }

  irDetalleDocumentacion(usuario: TablaVerificacionDocsInterface) {
    let ruta = this._nav.documentacionAspirante.replace(':id', usuario.idUsuario.toString());
    this._router.navigate([this._nav.privado + ruta])
  }

  limpiar() {
    this.filtroForm.reset();
    this.paginaActual = 0;
    this.first = 0;
    this.paginar();
  }


  limpiarObjeto<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, valor]) => valor !== undefined)
    ) as Partial<T>;
  }

}
