export interface VerificacionDocumentos {
  nombre: string,
  matricula: string,
  correo: string,
  especialidad: string,
  estatus: EstatusDocumentacion,
  observaciones: string,
  modalidad: string,
  tipoModalidad: string,
  fecha: string
}

export enum EstatusDocumentacion {
  'noCumple',
  'cumple',
  'pendiente',
  'revision'
}
