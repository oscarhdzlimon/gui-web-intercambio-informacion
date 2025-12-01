export interface TablaVerificacionDocsInterface {

  idUsuario: number,
  nombreCompleto: string,
  matriculaFolio: string | null,
  matricula: string | null,
  folio: string | null,
  correo: string | null,
  especialidad: string | null,
  idEstatusValidacion: number | null,
  estatusValidacion: string | null,
  observaciones: string | null,
  modalidad: string | null,
  tipoModalidad: string | null,
  fechaVerificacion: string | null,
  idTipoConvocatoria: number | null,
  desTipoConvocatoria: string | null,
  idUsuarioVerificador: number | null,
  nombreCompletoVerificador: string | null
}
