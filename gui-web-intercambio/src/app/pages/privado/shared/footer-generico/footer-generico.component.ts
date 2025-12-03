import { Component } from '@angular/core';
import {DynamicDialogRef} from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-footer-generico',
  imports: [ButtonModule],
  templateUrl: './footer-generico.component.html',
  styleUrl: './footer-generico.component.scss'
})
export class FooterGenericoComponent {

  constructor(public ref: DynamicDialogRef,
    

) {

}

  btnCerrar(){
    this.ref.close();
  }
}
