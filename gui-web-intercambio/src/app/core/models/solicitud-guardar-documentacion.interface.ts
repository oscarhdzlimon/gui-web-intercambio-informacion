export interface SolicitudGuardarDocumentacion {
  datosPersonales: {
    idUsuario: number
  },
  documentosObligatorios: SolicitudDocumentoObligatorio[],
  especialidadesDocumentos: DocumentoEspecialidad[],
  documentosConstancias?: DocumentoConstancia [],
  datosEmpleo?: DatosEmpleo,
  documentosEspecialidadesEliminar?: number[],
  documentosConstanciasEliminar?: number[],
}

export interface SolicitudDocumentoObligatorio {
  idDocumentoObligatorio?: number,
  tipoDocumentoObligatorio: {
    idDocumentoObligatorio: number
    desDocumentoObligatorio?: "TITULO" | "CEDULA PROFESIONAL"
  },
  documento: {
    refGuid: string
  }
}

export interface DocumentoEspecialidad {
  cveEspecialidad: string,
  desEspecialidad: string,
  documentosEspecialidad: RefDocumentoEspecialidad[]
}

export interface RefDocumentoEspecialidad {
  idDocumentoEspecialidad?: number,
  tipoDocumentoEspecialidad: {
    idTipoDocumentoEspecialidad: number
  },
  documento: {
    refGuid: string
  }
}


export interface DocumentoConstancia {
  idDocumentoConstancia?: number,
  refConstancia: string,
  documento: {
    refGuid: string
  }
}

export interface DatosEmpleo {
  indOtroEmpleo: 1 | 0,
  indMedicoSustituto: 1 | 0,
  tipoInstitucion: TipoInstitucion | null,
  nomEspecificacionInstitucion: string | null,
  cveOoad: string | null,
  desOoad: string | null,
  refJornadaInicio: string | null,
  refJornadaFin: string | null,
  diaSemanaInicio: {
    idDiaSemana: string | null
  },
  diaSemanaFin: {
    idDiaSemana: string | null
  }
}

export interface TipoInstitucion {
  idTipoInstitucion: 1 | 2
}
