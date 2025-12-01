export interface RefDocumentosLocalStorage {
  obligatorios: {
    1: string | null,
    2: string | null,
    3: string | null
  },
  especialidades: RefEspecialidadLocalStorage[],
  constancias: RefConstanciasLocalStorage[]
}

export interface RefEspecialidadLocalStorage {
  cveEspecialidad: string,
  documentos: DocumentoEspecialidadLocalStorage[]
}

export interface DocumentoEspecialidadLocalStorage {
  idTipo: number,
  refGuid: string
}

export interface RefConstanciasLocalStorage {
  ref: string,
  nombre: string,
}
