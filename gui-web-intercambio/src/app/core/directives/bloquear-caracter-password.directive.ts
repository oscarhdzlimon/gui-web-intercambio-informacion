import {Directive, HostListener} from '@angular/core';
import {PATRON_CARACTERES_ASCII} from '@utils/regex';

@Directive({
  selector: '[appBloquearCaracterPassword]'
})
export class BloquearCaracterPasswordDirective {


  constructor() {
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (!PATRON_CARACTERES_ASCII.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!PATRON_CARACTERES_ASCII.test(pastedText) || pastedText == '') {
      event.preventDefault();
    }
  }

}
