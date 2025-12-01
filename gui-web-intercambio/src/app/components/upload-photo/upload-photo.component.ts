import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {PrimeNG} from 'primeng/config';
import {Button} from 'primeng/button';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import {FileUpload} from 'primeng/fileupload';
import {Menu} from 'primeng/menu';
import {AlertService} from '@services/alert.service';
import {SplitButton} from 'primeng/splitbutton';

@Component({
  selector: 'upload-photo',
  imports: [
    Button,
    PrimeTemplate,
    FileUpload,
    SplitButton
  ],
  templateUrl: './upload-photo.component.html',
  styleUrl: './upload-photo.component.scss'
})
export class UploadPhotoComponent implements OnInit, OnChanges {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @ViewChild('menu') menu!: Menu;

  @ViewChild('videoElement')
  set videoElementRef(element: ElementRef<HTMLVideoElement>) {
    this._videoElement = element;

    // Si ya se tiene un stream y el elemento acaba de ser creado, lo asignamos.
    if (this._videoElement && this.stream && this._videoElement.nativeElement.srcObject !== this.stream) {
      this._videoElement.nativeElement.srcObject = this.stream;
      this._videoElement.nativeElement.play();
    }
  }

  private _videoElement: ElementRef<HTMLVideoElement> | undefined;

  get videoElement(): ElementRef<HTMLVideoElement> | undefined {
    return this._videoElement;
  }

  alertaService: AlertService = inject(AlertService)

  @Input() clearOnFailedSave: boolean | undefined = undefined;
  @Input() disableUpload = false;
  @Input() maxFileSize: number = 5120000;
  @Input() existingFile: File | undefined = undefined;
  @Output() fileSelected = new EventEmitter<any>();
  @Output() fileRemoved = new EventEmitter<any>();
  @Output() cleanupDone = new EventEmitter<void>();
  files: any[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;

  items: MenuItem[] = []; // Opciones del menú
  mostrarCamara: boolean = false;
  stream: MediaStream | null = null;
  errorCamara: string = '';

  constructor(private readonly config: PrimeNG) {
    this.items = [
      {
        label: 'Cargar Fotografía',
        icon: 'pi pi-upload',
        command: () => this.seleccionarArchivo()
      },
      {
        label: 'Tomar Fotografía',
        icon: 'pi pi-camera',
        command: () => this.tomarFotografia()
      }
    ];
  }

  ngOnInit() {
    // Se usa setTimeout para asegurar que el ViewChild 'fileUpload' esté disponible
    // justo después de que la vista se haya renderizado.
    setTimeout(() => {
      this.updateFileUpload(this.existingFile);
    }, 0);
  }

  mostrarOpciones(event: Event): void {
    if (this.menu) {
      this.menu.toggle(event);
    }
  }

  onRemoveTemplatingFile(event: any, file: any, removeFileCallback: any, index: any) {
    removeFileCallback(event, index);
    this.totalSize -= Number.parseInt(this.formatSize(file.size));
    this.totalSizePercent = this.totalSize / 10;
  }

  onRemoveFile(file: any, index: number) {
    this.files = [];
    this.fileUpload.clear();
    this.fileRemoved.emit(this.files);
  }

  formatSize(bytes: any) {
    const k: number = 1024;
    const dm: number = 3;
    const sizes: any = this.config.translation.fileSizeTypes;
    if (bytes === 0) {
      return `0 ${sizes[0]}`;
    }
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize: number = Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return `${formattedSize} ${sizes[i]}`;
  }

  onTemplatedUpload() {
  }

  cancelarCargaArchivo(): void {
    const elemento: HTMLElement | null = document.getElementById('clear_btn');
    if (!elemento) return;
    elemento.querySelector('button')?.click();
  }

  seleccionarArchivo(): void {
    const elemento: HTMLElement | null = document.getElementById('choose_btn');
    if (!elemento) return;
    elemento.querySelector('button')?.click();
  }

  cargarArchivo(): void {
    const elemento: HTMLElement | null = document.getElementById('load_btn');
    if (!elemento) return;
    elemento.querySelector('button')?.click();
  }

  handleKeyDown($event: KeyboardEvent): void {
    $event.preventDefault();
  }

  choose(event: any, callback: any) {
    callback();
  }

  uploadEvent(callback: any) {
    callback();
  }

  ngOnChanges(changes: SimpleChanges): void {

    const fileChange = changes['existingFile'];
    const clearChange = changes['clearOnFailedSave'];

    // Se actualiza si el valor de existingFile realmente ha cambiado
    if (fileChange && fileChange.currentValue !== fileChange.previousValue) {
      this.updateFileUpload(fileChange.currentValue);
    }

    // Lógica de limpieza forzada: SOLO cuando cambia a TRUE
    if (clearChange && clearChange.currentValue === true && clearChange.currentValue !== clearChange.previousValue) {
      this.clear(); // Limpiar el p-fileUpload
      this.cleanupDone.emit(); //Emite para que el padre pueda resetear el Input
    }
  }

  /**
   * Actualiza el valor interno del componente p-fileUpload y la lista local 'files'.
   */
  private updateFileUpload(file: File | undefined | null): void {

    if (!this.fileUpload) {
      // Debería estar disponible gracias a ngOnInit con setTimeou.
      console.warn('p-fileUpload no está listo para la actualización.');
      return;
    }

    // Limpiar el estado anterior
    this.fileUpload.clear();
    this.files = [];
    this.totalSize = 0;
    this.totalSizePercent = 0;

    if (file instanceof File) {
      const fileList: any[] = [file];

      // **La clave:** Asignar el archivo a la propiedad 'files' del componente PrimeNG
      this.fileUpload.files = fileList;
      this.files = fileList; // Actualizar la lista local
      this.totalSize = file.size;
    }

  }


  onSelectedFiles(event: any) {
    // Verificar si PrimeNG reportó algún archivo no válido
    // Los archivos inválidos por tamaño, tipo, etc., se encuentran en event.invalidFiles.
    for (const archivo of event.files) {
      if (!this.esImagenValida(archivo)) {

        // ¡Importante! Evitar que se procese o se emita algún archivo
        this.files = [];
        this.alertaService.error(`El archivo que intenta cargar no es válido.`);
        if (this.fileUpload) {
          this.fileUpload.clear();
        }
        if (this.existingFile) {
          this.fileUpload.files = [this.existingFile];
        } else {
          this.fileUpload.files = [];
        }
        this.files = this.fileUpload.files;
        return;
      }
    }
    if (event.currentFiles.length === 0) {
      this.alertaService.error(`El archivo  excede el tamaño máximo permitido.`);

      // ¡Importante! Evitar que se procese o se emita algún archivo
      this.files = [];
      if (this.fileUpload) {
        this.fileUpload.clear();
      }
      this.fileRemoved.emit([]); // Notificar la limpieza
      return;
    }

    this.files = event.currentFiles;
    if (this.files.length > 0) {
      this.fileSelected.emit(this.files);
    }
  }

  async tomarFotografia(): Promise<void> {

    if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
      this.alertaService.error('No se puede tomar la fotografía" (API no soportada).');
      return;
    }

    this.mostrarCamara = true; // Mostrar el contenedor de la cámara

    try {
      // Intenta con facingMode 'environment' (trasera), si falla, intenta 'user' (frontal)
      // Si ambos fallan, o solo quieres la frontal por defecto, ajusta aquí.
      // Para depurar, empecemos con una opción más general o 'user'.
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          // facingMode: { ideal: 'environment' }, // Comenta esta línea por ahora para probar
          width: {ideal: 1280},
          height: {ideal: 720}
        }
      });

      // Si el videoElement ya está disponible (por el setter @ViewChild), se asignará.
      // Si no, el setter lo asignará cuando el elemento se renderice.
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.videoElement.nativeElement.play();
      }

    } catch (err: any) {
      this.apagarCamara(false); // Apaga el stream, pero mantén el overlay visible para el error

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.alertaService.error('No se puede tomar la fotografía (Permiso denegado).');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.alertaService.error('No se puede tomar la fotografía (Cámara no encontrada).');
      } else if (err.name === 'OverconstrainedError') {
        this.alertaService.error('No se puede tomar la fotografía (Restricciones de cámara no satisfechas).');
        console.error('OverconstrainedError: ' + err.message);
        // Si es un OverconstrainedError, puede ser por width/height/facingMode.
        // Se Intenta con restricciones más flexibles:
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({video: true}); // Solo pedir video
          if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.srcObject = this.stream;
            this.videoElement.nativeElement.play();
          }
        } catch (retryErr: any) {
          this.alertaService.error('No se puede tomar la fotografía" (Error al reintentar: ' + retryErr.name + ').');
          this.apagarCamara(false);
        }
      } else {
        this.alertaService.error('No se puede tomar la fotografía (' + err.name + ': ' + err.message + ').');
      }
      console.error('Error al acceder a la cámara:', err);
    }
  }

  capturarFoto(): void {
    if (!this.stream || !this.videoElement || !this.videoElement.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const originalCanvas = document.createElement('canvas');
    originalCanvas.width = video.videoWidth;
    originalCanvas.height = video.videoHeight;
    const originalContext = originalCanvas.getContext('2d');

    if (originalContext) {
      originalContext.drawImage(video, 0, 0, originalCanvas.width, originalCanvas.height);

      const maxWidth = 1024;
      const maxHeight = 768;
      const quality = 0.8;

      let width = originalCanvas.width;
      let height = originalCanvas.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = width;
      resizedCanvas.height = height;
      const resizedContext = resizedCanvas.getContext('2d');

      if (resizedContext) {
        resizedContext.drawImage(originalCanvas, 0, 0, width, height);

        resizedCanvas.toBlob((blob) => {
          if (blob) {
            const fileName = `foto-capturada-${new Date().getTime()}.jpeg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            if (file.size > this.maxFileSize) {
                this.errorCamara = `MSG033: La foto es demasiado grande (${this.formatSize(file.size)}). Intenta de nuevo.`;
                this.apagarCamara(false);
                return;
            }

            this.manejarArchivoCapturado(file);
          } else {
              this.errorCamara = 'MSG033: Error al comprimir la imagen.';
              this.apagarCamara(false);
          }
        }, 'image/jpeg', quality);
      }
    }

    if (!this.errorCamara) {
      this.apagarCamara(true);
    }
  }

  // Método para cerrar el stream de la cámara
  apagarCamara(ocultarContenedor: boolean = true): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (ocultarContenedor) {
      this.errorCamara = ''; // Limpiar el error si se cierra la vista
      this.mostrarCamara = false;
    }
  }

  // Procesa y emite el archivo capturado
  manejarArchivoCapturado(file: File): void {
    // Limpia los archivos actuales del p-fileupload
    this.fileUpload.clear();

    // Crea la lista con el nuevo archivo
    const fileList: any[] = [file];

    // Inyecta el archivo en la lista interna de PrimeNG
    this.fileUpload.files = fileList;
    this.files = fileList;

    // Emite el evento como si se hubiera seleccionado
    this.fileSelected.emit(this.files);
  }

  esImagenValida(archivo: File): boolean {
    const tiposPermitidos = ['image/jpeg', 'image/png'];
    const extensionesPermitidas = ['jpg', 'jpeg', 'png'];

    const extension = archivo.name.split('.').pop()?.toLowerCase();

    return (
      tiposPermitidos.includes(archivo.type) &&
      extensionesPermitidas.includes(extension || '')
    );
  }


  clear() {
    this.updateFileUpload(null); // Se usa la función de actualización para limpiar
  }

}
