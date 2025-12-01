export interface HttpRespuesta<T> {
    exito: boolean;
    mensaje: string;
    respuesta: T;
    [x: string]: any;
  }
  