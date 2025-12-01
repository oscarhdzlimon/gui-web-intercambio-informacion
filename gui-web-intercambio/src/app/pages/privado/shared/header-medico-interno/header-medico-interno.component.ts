import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {IconCardComponent} from "@components/icon-card/icon-card.component";
import {SesionUser} from '@models/sesion-user.interface';
import {UserService} from '@services/user.service';

@Component({
  selector: 'header-medico-interno',
  imports: [
    IconCardComponent
  ],
  templateUrl: './header-medico-interno.component.html',
  styleUrl: './header-medico-interno.component.scss'
})
export class HeaderMedicoInternoComponent implements OnInit{
  userService = inject(UserService);
  userData: WritableSignal<SesionUser|null> = signal(null);

  ngOnInit() {
    this.userService.userData$.subscribe({
      next:(elemento) => this.userData.set(elemento)
    });
  }

}
