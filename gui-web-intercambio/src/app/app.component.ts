import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '@components/footer/footer.component';
import {AlertComponent} from '@components/alert/alert.component';
import {NgxSpinnerModule} from 'ngx-spinner';
import {ConfirmationService} from 'primeng/api';
import {CommonModule} from '@angular/common';
import {SvgAnimationComponent} from '@components/svg-animation/svg-animation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, AlertComponent, NgxSpinnerModule, CommonModule, SvgAnimationComponent],
  providers: [
    /* SE COMENTA TIMER */
    //SessionTimerService,
    ConfirmationService
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

})
export class AppComponent {
  title: string = 'Convocatoria para Médicos Especialistas';

  /* SE COMENTA TIMER */
  /* confirmationService = inject(ConfirmationService);


acceptConfirmation(): void {
  // Nota: Aunque el nombre es 'accept', PrimeNG lo usa para disparar
  // la función que está en el callback 'accept' de tu objeto Confirmation.
  this.confirmationService.onAccept();
} */


}
