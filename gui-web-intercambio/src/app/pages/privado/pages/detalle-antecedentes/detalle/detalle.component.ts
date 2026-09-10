import {Component, inject, OnInit} from '@angular/core';
import {TablaDetalleGestionInterface} from '@models/tablas-detalle-antecedentes.interface';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ButtonModule} from 'primeng/button';
import {UserService} from '@services/user.service';
import {SesionUser} from '@models/sesion-user.interface';
import {DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {CryptoService} from '@services/crypto.service';
import {environment} from '@env/environment.development';

@Component({
  selector: 'app-detalle',
  imports: [ButtonModule],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
  providers: [DatePipe],
})
export class DetalleComponent implements OnInit {
  horario: string;

  cifradoService: CryptoService = inject(CryptoService);

  readonly AES_KEY_BASE64: string = environment.key.AES_KEY_BASE64;
  private readonly catalogoOoadUmaeUrl = 'assets/catalogo-ooad-umae.json';
  cifrado = ''

  constructor(
    public ref: DynamicDialogRef,
    public readonly data: DynamicDialogConfig,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
  ) {
    const ahora = new Date();
    this.horario = `Horario de consulta ${this.datePipe.transform(
      ahora,
      'dd/MM/yyyy - HH:mm:ss'
    )}`;
  }

  userService = inject(UserService);
  userData: SesionUser | null = null;

  strTitulo = '';
  registro!: TablaDetalleGestionInterface;
  consecutivo!: number;
  folio: string = '';
  persona: string = '';
  peticionarios: string = '';
  nss: string = '';

  ooad: string = '';
  unidad: string = '';
  estado: string = '';
  cierre: string = '';

  usuarioLogueado = '';
  ooadLogueado = '';

  datosDetalle: any;
  fecha: Date = new Date();

  ngOnInit() {
    this.userService.userData$.subscribe((user) => (this.userData = user));

    if (this.data?.data) {
      this.strTitulo = this.data.data.titulo;
      this.datosDetalle = this.data.data;
      this.registro = this.data.data.idRegistro;
      this.consecutivo = this.data.data.consecutivo;
      this.folio = this.data.data.expediente;
      this.persona = this.data.data.persona;
      this.peticionarios = this.data.data.nombrePeticionario;
      this.nss = this.data.data.nss;
      this.fecha = this.data.data.fechaCreacion;
      this.ooad = this.data.data.ooadInvolucrado;
      this.unidad = this.data.data.unidad;
      this.estado = this.data.data.estado;
      this.cierre = this.data.data.fechaCierre;
    }

    this.route.queryParams.subscribe((qp) => {

        if (qp['valor']) {
          this.cifrado = qp['valor'] as string;
          void this.obtenerExpediente();
        } else {
          this.usuarioLogueado = this.userData?.nombreCompleto ?? '';
          this.cargarDescripcionOoadUmae(this.userData?.ooad) ?? '';
        }
      }
    );
  }

  async obtenerExpediente() {
    try {
      const REF_SISTEMA = await this.cifradoService.decryptToObject<any>(
        this.cifrado,
        this.AES_KEY_BASE64
      );
      //this.ooadLogueado = REF_SISTEMA.ooad_UMAE;

      this.cargarDescripcionOoadUmae(REF_SISTEMA.ooad_UMAE);

      console.log(this.ooadLogueado);
      this.usuarioLogueado = REF_SISTEMA.usuarioLogueado;
    } catch (error) {
      console.error("Error al descifrar. Posibles causas: Clave incorrecta o JSON malformado", error);
    }
  }

    private cargarDescripcionOoadUmae(idOoadUmae: string | null | undefined): void {
    const id = String(idOoadUmae ?? '').trim();
    if (!id) return;

    fetch(this.catalogoOoadUmaeUrl)
      .then(response => response.ok ? response.json() : Promise.reject(response.status))
      .then((catalogo: Array<{ id: string; descripcion: string }>) => {
        const registro = catalogo.find(item => String(item.id).trim() === id);
        if (registro) this.ooadLogueado = registro.descripcion;
      })
      .catch(error => console.error('Error al cargar catalogo OOAD/UMAE:', error));
  }
}
