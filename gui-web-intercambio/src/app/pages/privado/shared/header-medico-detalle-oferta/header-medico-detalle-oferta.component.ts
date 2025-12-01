import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {DynamicDialogRef} from 'primeng/dynamicdialog';
import {Button} from 'primeng/button';
import {Badge} from 'primeng/badge';
import {Subscription} from 'rxjs';
import {EstadoOfertaService, OfertaEstado} from '@services/estado-oferta.service';

@Component({
  selector: 'app-header-medico-detalle-oferta',
  imports: [
    Button,
    Badge
  ],
  templateUrl: './header-medico-detalle-oferta.component.html',
  styleUrl: './header-medico-detalle-oferta.component.scss'
})
export class HeaderMedicoDetalleOfertaComponent implements OnInit, OnDestroy {

  private estadoSubscription: Subscription = new Subscription();
  oferta: WritableSignal<null | OfertaEstado> = signal(null);

  constructor(public ref: DynamicDialogRef,
              private readonly estadoOfertaService: EstadoOfertaService) {
  }

  closeDialog(): void {
    this.ref.close();
  }

  ngOnInit(): void {
    // Suscribirse al Observable para reaccionar a los cambios de estado
    this.estadoSubscription = this.estadoOfertaService.estadoActual$.subscribe(
      (estado: OfertaEstado) => {
        // Asigna los valores recibidos a las propiedades del componente
        this.oferta.update(value => estado)
      }
    );
  }

  ngOnDestroy(): void {
    // IMPORTANTE: Desuscribirse para evitar fugas de memoria
    this.estadoSubscription.unsubscribe();
  }
}
