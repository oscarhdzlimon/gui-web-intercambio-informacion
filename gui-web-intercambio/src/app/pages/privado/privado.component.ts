import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MenuComponent} from '@components/menu/menu.component';
import {InactividadDialogComponent} from '@components/inactividad-dialog/inactividad-dialog.component';

@Component({
  selector: 'app-privado',
  imports: [
    RouterOutlet,
    MenuComponent,
    InactividadDialogComponent
  ],
  templateUrl: './privado.component.html',
  styleUrl: './privado.component.scss'
})
export class PrivadoComponent {

}
