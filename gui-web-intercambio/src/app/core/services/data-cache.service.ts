import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root' // Es un servicio singleton para toda la aplicación
})
export class DataCacheService {
  // Mapa para almacenar los datos, donde la clave es el UUID
  private cache = new Map<string, any>();

  /**
   * Guarda un objeto de datos y genera un UUID para indexarlo.
   * @param data El objeto a guardar.
   * @returns El UUID generado para esta entrada.
   */
  public saveData(data: any): string {
    const id = crypto.randomUUID();
    this.cache.set(id, data);
    return id;
  }

  /**
   * Recupera un objeto de datos por su UUID y lo elimina del caché.
   * @param id El UUID de la entrada.
   * @returns Los datos recuperados o null si no se encuentran.
   */
  public retrieveData(id: string): any | null {
    const data = this.cache.get(id);

    // Opcional: Eliminar los datos del caché una vez leídos para liberar memoria
    // this.cache.delete(id);

    return data || null;
  }
}
