import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  /**
   * Descifra datos y los transforma en un objeto JSON
   * @param base64Data Datos cifrados (IV + Ciphertext)
   * @param keyBase64 Clave AES en Base64
   */
  async decryptToObject<T>(base64Data: string, keyBase64: string): Promise<T> {
    try {
      // Convertir Base64 a Buffers
      const rawData = this.base64ToUint8Array(base64Data);
      const keyBuffer = this.base64ToUint8Array(keyBase64);

      // Extraer IV (16 bytes) y Datos
      const iv = rawData.slice(0, 16);
      const encryptedData = rawData.slice(16);

      // Importar Clave
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
      );

      // Descifrar
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        cryptoKey,
        encryptedData
      );

      // Decodificar y parsear a Objeto
      const decodedString = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decodedString) as T;

    } catch (error) {
      console.error('Error en el proceso de descifrado:', error);
      throw new Error('Formato de datos inválido o clave incorrecta');
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    // Revertir encodeURIComponent (por si acaso)
    let cleanBase64 = decodeURIComponent(base64);

    // Eliminar espacios en blanco o saltos de línea
    cleanBase64 = cleanBase64.replace(/\s/g, '');

    try {
      const binaryString = window.atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      console.error("El string Base64 sigue siendo inválido después de la limpieza:", cleanBase64);
      throw e;
    }
  }
}
