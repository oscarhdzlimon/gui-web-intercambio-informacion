import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClickService {

  private clickBase = new Subject<void>();
  clic$ = this.clickBase.asObservable();

  constructor() { }


  emitirClick(){
    this.clickBase.next();
  }
}
