export interface DetalleDocumentacion {
  datosPersonales: DetalleDocumentacionDatosPersonales;
  participacion: DetalleDocumentacionParticipacion;
  documentosObligatorios: DetalleDocumentacionDocumentoObligatorio[];
  especialidadesDocumentos: DetalleDocumentacionEspecialidadDocumento[];
  documentosConstancias: DetalleDocumentacionDocumentoConstancia[];
  refObservaciones: string;
}

export interface DetalleDocumentacionDocumento {
  refGuid: string;
  refNombre: string;
  refExtension: string;
}

export interface DetalleDocumentacionPerfil {
  idPerfil: number;
  desPerfil: string;
}

export interface DetalleDocumentacionEstatusVerificacion {
  idEstatusVerificacion: number;
  desEstatus: string;
}

export interface DetalleDocumentacionEvaluacionEspecialidad {
  idEspecialidadEvaluacion: number,
  estatusVerificacion: {
    idEstatusVerificacion: number,
    desEstatus: string
  },
  indActivo: 1
}

export interface DetalleDocumentacionTipoDocumentoObligatorio {
  idDocumentoObligatorio: number;
  desDocumentoObligatorio: string;
}

export interface DetalleDocumentacionTipoDocumentoEspecialidad {
  idTipoDocumentoEspecialidad: number;
  desTipoDocumentoEspecialidad: string;
}

export interface DetalleDocumentacionDatosPersonales {
  idUsuario: number;
  cveMatricula: string | null;
  especialidad: string;
  refEmail: string;
  nombreCompleto: string;
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string,
  refFolio: string | null;
  perfil: DetalleDocumentacionPerfil;
}

export interface DetalleDocumentacionResultadoVerificacion {
  idResultadoVerificacion: number;
  estatusVerificacion: DetalleDocumentacionEstatusVerificacion;
  refObservaciones: string;
  usuarioVerificador: string | null;
}

export interface DetalleDocumentacionParticipacion {
  idParticipacion: number;
  idUsuario: number;
  idConvocatoria: number;
  desFolioMe: string | null;
  resultadoVerificacion: DetalleDocumentacionResultadoVerificacion;
}

export interface DetalleDocumentacionDocumentoObligatorio {
  idDocumentoObligatorio: number;
  tipoDocumentoObligatorio: DetalleDocumentacionTipoDocumentoObligatorio;
  documento: DetalleDocumentacionDocumento;
}

export interface DetalleDocumentacionDocumentoEspecialidad {
  idDocumentoEspecialidad: number;
  tipoDocumentoEspecialidad: DetalleDocumentacionTipoDocumentoEspecialidad;
  documento: DetalleDocumentacionDocumento;
  indCubre: boolean | null;
}

export interface DetalleDocumentacionEspecialidadDocumento {
  idEspecialidadDocumento: number;
  cveEspecialidad: string;
  desEspecialidad: string;
  documentosEspecialidad: DetalleDocumentacionDocumentoEspecialidad[];
  evaluacionEspecialidad: DetalleDocumentacionEvaluacionEspecialidad | null;
}

export interface DetalleDocumentacionDocumentoConstancia {
  idDocumentoConstancia: number;
  refConstancia: string;
  documento: DetalleDocumentacionDocumento;
}
