import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {CurrencyPipe,CommonModule, } from "@angular/common";
import {Card} from 'primeng/card';
import {Rating} from 'primeng/rating';
import {FormsModule} from '@angular/forms';
import {Badge} from 'primeng/badge';
import {OportunidadLaboral} from '@models/oportunidad-laboral.interface';
import {EstadoOfertaService} from '@services/estado-oferta.service';
import {ConvocatoriaService} from '@services/convocatoria.service';
import {UserService} from '@services/user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {TitleCasePipe} from '@angular/common';
import {SvgAnimationService} from '@services/svg-animation.service';


@Component({
  selector: 'oferta-card',
  imports: [
    Card,
    Rating,
    FormsModule,
    CommonModule,
    Badge,
    TitleCasePipe
  ],
  templateUrl: './oferta-card.component.html',
  styleUrl: './oferta-card.component.scss',
  providers: [CurrencyPipe]
})
export class OfertaCardComponent  implements OnInit, OnChanges {
  private readonly MOBILE_BREAKPOINT = 768;

  loaderService = inject(SvgAnimationService)

  isMobileView: boolean = false;

  value: number = 0;

  estadoOfertaService: EstadoOfertaService = inject(EstadoOfertaService);
  convocatoriaService: ConvocatoriaService = inject(ConvocatoriaService);
  userService: UserService = inject(UserService);

  userData!: null | SesionUser;

  @Output() abrirDetalleEvent = new EventEmitter<OportunidadLaboral>();
  @Output() actualizarTotales = new EventEmitter<boolean>();

  @Input() detalleOportunidad: OportunidadLaboral =
    {
      idPlaza: 0,
      cveOoad: null,
      cvePuesto: null,
      cveUnidad: null,
      porcAltoCostoVida: null,
      especialidad: null,
      esFavorita: false,
      categoria: null,
      regimen: null,
      turno: null,
      tipoPlaza: null,
      marcaOcupacion: null,
      umf: null,
      nuevoHospital: null,
      ubicacion: null,
      zona: null,
      direccion: null,
      sueldoMensualBruto: null,
      sueldoMensualNeto: null,
      horario: null,
      numPlaza: null,
      clasificacion: null,
      ooad: null,
      creditos: null,
      bonoDificilCobertura: null,
      accesoCredito: null,
      creditoAutomotriz: null,
      descuentoQuincenalCreditoAutomotriz: null,
      creditoHipotecario: null,
      descuentoQuincenalCreditoHipotecario: null,
    };

  constructor(private readonly currencyPipe: CurrencyPipe) {
    
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth < this.MOBILE_BREAKPOINT;
  }

  ngOnInit() {
    this.userService.userData$.subscribe(user => this.userData = user);
    this.value = this.detalleOportunidad.esFavorita ? 1 : 0;


   
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detalleOportunidad']) {
      const currentOportunidad = changes['detalleOportunidad'].currentValue;

      if (currentOportunidad?.esFavorita !== 'undefined') {
        this.value = currentOportunidad.esFavorita ? 1 : 0;
      }
    }
  }

  verMas(): void {
    this.abrirDetalleEvent.emit(this.detalleOportunidad);
  }

  agregarFavorito(): void {
    const solicitud = {
      idUsuario: this.userData?.idUsuario as number,
      idPlaza: this.detalleOportunidad.idPlaza,
      esFavorita: true
    };
    this.convocatoriaService.agregarFavorito(solicitud).subscribe({
      next: () => {
        this.loaderService.show();
        this.actualizarTotales.emit(true);
      }
    });
  }

  quitarFavorito(): void {
    const solicitud = {
      idUsuario: this.userData?.idUsuario as number,
      idPlaza: this.detalleOportunidad.idPlaza,
      esFavorita: false
    };
    this.convocatoriaService.agregarFavorito(solicitud).subscribe({
      next: () => {
        this.actualizarTotales.emit(true)
      }
    });
  }

 
}
