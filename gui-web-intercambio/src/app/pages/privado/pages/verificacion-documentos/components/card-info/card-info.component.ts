import {Component, HostListener, Input, OnInit} from '@angular/core';
import {BtnRegresarComponent} from '@components/btn-regresar/btn-regresar.component';
import {PillComponent} from '@components/pill/pill.component';
import {Card} from 'primeng/card';
import {
  DetalleDocumentacionDatosPersonales, DetalleDocumentacionResultadoVerificacion
} from '@models/detalleDocumentacionAspirante.interface';
import {TitleCasePipe} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {GeneralComponent} from '@components/general.component';

@Component({
  selector: 'app-card-info',
  imports: [BtnRegresarComponent, PillComponent, Card, TitleCasePipe],
  templateUrl: './card-info.component.html',
  styleUrl: './card-info.component.scss'
})
export class CardInfoComponent extends GeneralComponent implements OnInit {
  private readonly MOBILE_BREAKPOINT = 768;

  isMobileView: boolean = false;

  @Input() datosPersonales!: DetalleDocumentacionDatosPersonales;
  @Input() evaluacion!: DetalleDocumentacionResultadoVerificacion;

  ruta: string;
  datosFoto!: any;
  nombreFoto!: string;
  defaultFile!: SafeResourceUrl | undefined;

  constructor(private readonly sanitizer: DomSanitizer) {
    super();
    this.checkScreenSize();
    this.ruta = this._nav.privado + this._nav.verificacionDocumentos;
  }

  ngOnInit() {
    this.obtenerDatosFoto(this.datosPersonales.idUsuario);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  obtenerDatosFoto(idusuario: number | undefined): void {
    if (!idusuario) return;
    this._ConvocatoriaService.getDatosFotografia(idusuario).subscribe({
      next: (response: any) => {
        if (!response.exito) return;
        this.datosFoto = response.respuesta.fotografia;
        this.obtenerFotografia()
      }
    });
  }

  obtenerFotografia(): void {
    if (!this.datosFoto) return;
    this.documentoService.getFotografia(this.datosFoto.documento.refGuid).pipe(
    ).subscribe({
      next: (response: any) => {
        let extension = ['png', 'jpeg', 'jpg'];
        if (extension.includes(this.datosFoto.documento.refExtension.toLowerCase())) {
          this.nombreFoto = this.datosFoto.documento.refNombre;
          const blob = new Blob([response], {type: 'blob'});
          this.defaultFile = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        } else {
          this.nombreFoto = 'Sin foto'
        }
      }
    });
  }

}
