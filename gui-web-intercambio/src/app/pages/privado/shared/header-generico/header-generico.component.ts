import {Component, OnDestroy, OnInit, signal, WritableSignal,Inject} from '@angular/core';
import {Button} from 'primeng/button';
import {Badge} from 'primeng/badge';
import {Subscription} from 'rxjs';
import {DynamicDialogConfig,DynamicDialogRef} from 'primeng/dynamicdialog';


@Component({
  selector: 'app-header-generico',
  imports: [    Button,
    Badge],
  templateUrl: './header-generico.component.html',
  styleUrl: './header-generico.component.scss'
})
export class HeaderGenericoComponent implements OnInit, OnDestroy {

  private estadoSubscription: Subscription = new Subscription();
  oferta: WritableSignal<null | any> = signal(null);

strTitulo="";
  constructor(   private readonly data: DynamicDialogConfig,
    public ref: DynamicDialogRef,
              //private readonly estadoOfertaService: EstadoOfertaService
              ) {

  }

  closeDialog(): void {
    this.ref.close();
  }

  ngOnInit(): void {
    
    

      if (this.data?.data) {
        this.strTitulo = this.data.data.titulo;
        console.log(this.data);
      }
    
    
    
    // Suscribirse al Observable para reaccionar a los cambios de estado
   /*  this.estadoSubscription = this.estadoOfertaService.estadoActual$.subscribe(
      (estado: OfertaEstado) => {
        // Asigna los valores recibidos a las propiedades del componente
        this.oferta.update(value => estado)
      }
    ); */
  }

  ngOnDestroy(): void {
    // IMPORTANTE: Desuscribirse para evitar fugas de memoria
   // this.estadoSubscription.unsubscribe();
  }
}
