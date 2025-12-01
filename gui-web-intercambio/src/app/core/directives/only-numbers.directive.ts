import {Directive, ElementRef, forwardRef, HostListener, Renderer2} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Directive({
  selector: 'input[appOnlyNumbers]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => OnlyNumbersDirective),
    multi: true
  }]
})
export class OnlyNumbersDirective implements ControlValueAccessor {
  private onChange!: (val: string) => void;
  private onTouched!: () => void;
  private value!: string;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2
  ) {
  }

  @HostListener('input', ['$event.target.value'])
  onInputChange(value: string): void {
    const valorFiltrado: string = filtrarValor(value);
    this.actualizarTextInput(valorFiltrado, this.value !== valorFiltrado);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  private actualizarTextInput(nuevoValor: string, propagarCambio: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', nuevoValor);
    if (propagarCambio) {
      this.onChange(nuevoValor);
    }
    this.value = nuevoValor;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  writeValue(value: any): void {
    value = value ? String(value) : '';
    this.actualizarTextInput(value, false);
  }

}

function filtrarValor(value: string): string {
  return value.replaceAll(/\D*/g, '');
}
