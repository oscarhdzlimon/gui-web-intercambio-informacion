import {Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[appSplitByWidth]',
  standalone: true
})
export class SplitByWidthDirective implements OnInit, OnDestroy {
  // El string completo que se recibe
  @Input('appSplitByWidth') fullText: string = '';

  // Ajusta esto según el CSS de tu etiqueta (pixeles)
  private readonly MAX_WIDTH = 200;

  // Referencia al div temporal para medición
  private tempMeasurer: HTMLDivElement | null = null;

  // Escucha los cambios de tamaño de ventana para re-evaluar la división
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.splitAndRender();
  }

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2
  ) {
  }

  ngOnInit() {
    // El 'setTimeout' es necesario para asegurar que el DOM se renderice antes de medir
    setTimeout(() => this.splitAndRender(), 0);
  }

  ngOnDestroy() {
    // Limpia el elemento temporal si se usó
    if (this.tempMeasurer) {
      this.renderer.removeChild(document.body, this.tempMeasurer);
    }
  }

  // --- Lógica de División y Renderizado ---
  private splitAndRender(): void {
    if (!this.fullText) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
      return;
    }

    // 1. Se prepara el texto (sin la etiqueta fija)
    const textParts = this.fullText.split('Ubicación: ');
    const addressText = textParts.length > 1 ? textParts[1].trim() : this.fullText.trim();
    const words = addressText.split(' ');

    let currentLine = '';
    let resultHTML = ''; // Etiqueta fija

    // 2. Creación de un elemento 'medidor' invisible para calcular el ancho de cada palabra
    if (!this.tempMeasurer) {
      this.tempMeasurer = this.renderer.createElement('div');
      // Copiar estilos de fuente del elemento original (CRÍTICO)
      this.renderer.setStyle(this.tempMeasurer, 'position', 'absolute');
      this.renderer.setStyle(this.tempMeasurer, 'visibility', 'hidden');
      this.renderer.setStyle(this.tempMeasurer, 'white-space', 'nowrap');
      // Copiar el estilo de fuente del elemento original
      const computedStyle = globalThis.getComputedStyle(this.el.nativeElement);
      this.renderer.setStyle(this.tempMeasurer, 'font-size', computedStyle.fontSize);
      this.renderer.setStyle(this.tempMeasurer, 'font-family', computedStyle.fontFamily);
      this.renderer.appendChild(document.body, this.tempMeasurer);
    }

    // 3. Se itera palabra por palabra
    for (const word of words) {
      const prospectiveLine = (currentLine === '' ? '' : currentLine + ' ') + word;

      // Se mide el ancho de la línea potencial
      this.renderer.setProperty(this.tempMeasurer, 'textContent', prospectiveLine);
      const newWidth = this.tempMeasurer!.offsetWidth;

      if (currentLine !== '' && newWidth > this.MAX_WIDTH) {
        // La nueva palabra excede el límite: forzar salto de línea
        resultHTML += `<br>${word}`;
        currentLine = word; // Reiniciar la línea
      } else {
        // No excede: continuar en la misma línea
        resultHTML += (resultHTML.endsWith(': ') ? '' : ' ') + word;
        currentLine = prospectiveLine;
      }
    }

    // 4. Inyectar el HTML con el <br>
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', resultHTML);
  }
}
