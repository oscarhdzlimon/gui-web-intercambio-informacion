import {Injectable} from '@angular/core';
import {TabNode} from '@models/tab-node.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentosLocalstorageService {

  readonly DOC_STORAGE_KEY = 'docs_aspirante';

  constructor() {
  }

  guardarRefGuidObligatorio(idDocumentoObligatorio: number, refGuid: string) {

    //  Obtener los datos existentes o inicializar un objeto vacío
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);
    let informacionActualizada = informacionGuardada ? JSON.parse(informacionGuardada) : {
      obligatorios: {},
      especialidades: [],
      constancias: {}
    };

    // Se convierte el idDocumentoObligatorio a string para usarlo como clave de objeto
    informacionActualizada.obligatorios[idDocumentoObligatorio] = refGuid;

    // Guardar el objeto actualizado en localStorage
    localStorage.setItem(this.DOC_STORAGE_KEY, JSON.stringify(informacionActualizada));

  }

  guardarRefGuidEspecialidad(especialidades: TabNode[]) {
    //  Obtener los datos existentes o inicializar un objeto vacío
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);
    let informacionActualizada = informacionGuardada ? JSON.parse(informacionGuardada) : {
      obligatorios: {},
      especialidades: [],
      constancias: {}
    };

    // Se convierte el idDocumentoObligatorio a string para usarlo como clave de objeto
    informacionActualizada.especialidades = especialidades;

    // Guardar el objeto actualizado en localStorage
    localStorage.setItem(this.DOC_STORAGE_KEY, JSON.stringify(informacionActualizada));

  }

  guardarRefGuidConstancia(idConstancia: number, refGuid: string, nombre: string) {

    //  Obtener los datos existentes o inicializar un objeto vacío
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);
    let informacionActualizada = informacionGuardada ? JSON.parse(informacionGuardada) : {
      obligatorios: {},
      especialidades: [],
      constancias: {}
    };

    // Se convierte el idConstancia a string para usarlo como clave de objeto
    informacionActualizada.constancias[idConstancia] = {refGuid, nombre};

    // Guardar el objeto actualizado en localStorage
    localStorage.setItem(this.DOC_STORAGE_KEY, JSON.stringify(informacionActualizada));

  }

  obtenerRefGuid(idDocumentoObligatorio: number) {
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);

    if (informacionGuardada) {
      const documento = JSON.parse(informacionGuardada);
      return documento.obligatorios[idDocumentoObligatorio] ?? null;
    }
    return null;
  }

  obtenerRefGuidEspecialidad(): TabNode[] {
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);

    if (informacionGuardada) {
      const documento = JSON.parse(informacionGuardada);
      return documento.especialidades ?? [];
    }
    return [];
  }

  obtenerRefConstancia(idDocumentoConstancia: number) {
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);

    if (informacionGuardada) {
      const documento = JSON.parse(informacionGuardada);
      return documento.constancias[idDocumentoConstancia] ?? null;
    }
    return null;
  }

  obtenerRefConstanciaCompleta() {
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);

    if (informacionGuardada) {
      const documento = JSON.parse(informacionGuardada);
      return documento.constancias;
    }
    return [];
  }

  limpiar(): void {
    localStorage.removeItem(this.DOC_STORAGE_KEY);
  }

  eliminarArchivoObligatorio(idDocumentoObligatorio: number): void {
    //  Obtener los datos existentes o inicializar un objeto vacío
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);
    let informacionActualizada = informacionGuardada ? JSON.parse(informacionGuardada) : {
      obligatorios: {},
      especialidades: [],
      constancias: {}
    };

    if (informacionActualizada.obligatorios[idDocumentoObligatorio]) {
      delete informacionActualizada.obligatorios[idDocumentoObligatorio];
    }
    // Guardar el objeto actualizado en localStorage
    localStorage.setItem(this.DOC_STORAGE_KEY, JSON.stringify(informacionActualizada));

  }

  eliminarArchivoConstancia(idConstancia: number): void {
    //  Obtener los datos existentes o inicializar un objeto vacío
    const informacionGuardada = localStorage.getItem(this.DOC_STORAGE_KEY);
    let informacionActualizada = informacionGuardada ? JSON.parse(informacionGuardada) : {
      obligatorios: {},
      especialidades: [],
      constancias: {}
    };

    if (informacionActualizada.constancias[idConstancia]) {
      delete informacionActualizada.constancias[idConstancia];
    }
    // Guardar el objeto actualizado en localStorage
    localStorage.setItem(this.DOC_STORAGE_KEY, JSON.stringify(informacionActualizada));

  }
}
