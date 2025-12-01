import {Component, Input} from '@angular/core';

@Component({
  selector: 'header-tab',
  imports: [],
  templateUrl: './header-tab.component.html',
  styleUrl: './header-tab.component.scss'
})
export class HeaderTabComponent {
  @Input() title: string = '';
  @Input() numDocs: number | string = '';

}
