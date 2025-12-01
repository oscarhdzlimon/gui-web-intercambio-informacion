import {Component, inject,OnInit} from '@angular/core';
import {AuthService} from '@services/auth.service';
import { GeneralComponent } from '@components/general.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-footer-medico',
  imports: [],
  templateUrl: './footer-medico.component.html',
  styleUrl: './footer-medico.component.scss'
})
export class FooterMedicoComponent extends GeneralComponent implements OnInit {

  imgPerfil: SafeResourceUrl | undefined;
    sesion = this.authService.usuarioSesion;


    constructor(private sanitizer: DomSanitizer
    ) {
      super();
    }

    ngOnInit() {
      console.log("session",this.sesion);
      let datosF = this.getSession('datosFoto');
      if (datosF) {
        console.log("datosF:",datosF);
        this.getFoto(datosF);
      }
    }

    private getFoto(datosFoto: any) {
      this.documentoService.getFotografia(datosFoto.refGuid).pipe(
      ).subscribe({
        next: (response: any) => {
            const blob = new Blob([response],  { type: 'blob' });
          this.imgPerfil = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        }
      });
    }
}
