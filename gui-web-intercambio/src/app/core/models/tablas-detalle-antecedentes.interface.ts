export interface TablaDetalleGestionInterface {
  consecutivo: string | null,
  folio:string | null ,
  nombrePeticionario: string,
  fechaSuceso: string,
  fechaCreacion: string,
  fechaCierre: string,
  nombreAfectado: string,
  nss: string,
  ooadInvolucrado: string,
  unidadInvolucrada: string,
  estado: string,
  personaPromovente: string
  fechaSucesoFormateada: string | null,
  fechaCreacionFormateada: string | null,
  fechaCierreFormateada: string | null,
    
}

export interface TablaQuejaMedicaInterface {
  consecutivo: string | null,
  folio: string | null,
  nombrePromovente: string | null,
  nombrePeticionario: string | null,
  curp: string | null,
  nss: string | null,
  fechaSuceso: string | null,
  fechaSucesoFormateada: string | null,
  descripcionSuceso: string | null,
  ooadInvolucrado: string | null,
  unidadInvolucrada: string | null,
  fechaRecepcion: string | null,
  fechaRecepcionFormateada: string | null,
  estado: string | null,
  fechaCierreAcuerdo: string | null,
  fechaCierreAcuerdoFormateada: string | null,
  cierreAcuerdo: string | null,
  susceptibleConvenio: string | null,
}

export interface TablaInconformidades {
  consecutivo: string | null,
  fechaSuceso: string | null,
  fechaSucesoFormateada: string | null,
  fechaRecepcionFormateada: string | null,
  nombrePromovente: string | null,
  curp: string | null,
  descripcionSuceso: string | null,
  fechaRecepcion: string | null,
  fechaCierreAcuerdo: string | null,
  fechaCierreAcuerdoFormateada: string | null,
  fechaNotificacionResolucion: string | null,
  revocoResolucionFechaCumplimiento: string | null,
  fechaNotificacionResolucionFormateada: string | null,
  revocoResolucionFechaCumplimientoFormateada: string | null,
  expediente: string | null,
  nss: string | null,
  ooadInvolucrado: string | null,
  unidadInvolucrada: string | null,
  estado: string | null
}

export interface TablaAmparoIndirecto {
  consecutivo: string | null,
  nombrePeticionario: string | null,
  fechaSuceso: string | null,
  fechaSucesoFormateada: string | null,
  fechaRecepcionFormateada: string | null,
  nombrePromovente: string | null,
  descripcionSuceso: string | null,
  fechaRecepcion: string | null,
  fechaCierreAcuerdo: string | null,
  cierreAcuerdo: string | null,
  fechaCierreAcuerdoFormateada: string | null,
  fechaNotificacionResolucion: string | null,
  revocoResolucionFechaCumplimiento: string | null,
  fechaNotificacionResolucionFormateada: string | null,
  revocoResolucionFechaCumplimientoFormateada: string | null,
  expediente: string | null,
  nss: string | null,
  ooadInvolucrado: string | null,
  unidadInvolucrada: string | null,
  estado: string | null,
}

export interface TablaProcedimientoRpeInterface {
  consecutivo: string | null,
  nombrePeticionario: string | null,
  fechaSuceso: string | null,
  fechaSucesoFormateada: string | null,
  fechaRecepcionFormateada: string | null,
  cantidadPagada: string | null,
  nombrePromovente: string | null,
  descripcionSuceso: string | null,
  fechaRecepcion: string | null,
  fechaCierreAcuerdo: string | null,
  cierreAcuerdo: string | null,
  susceptibleConvenio: string | null,
  fechaCierreAcuerdoFormateada: string | null,
  fechaNotificacionResolucion: string | null,
  revocoResolucionFechaCumplimiento: string | null,
  fechaNotificacionResolucionFormateada: string | null,
  revocoResolucionFechaCumplimientoFormateada: string | null,
  expediente: string | null,
  nss: string | null,
  ooadInvolucrado: string | null,
  unidadInvolucrada: string | null,
  estado: string | null
}


export interface TablaJuicioContenciosoInterface {
  consecutivo: string | null
  fechaSuceso: string | null
  fechaSucesoFormateada: string | null
  fechaRecepcionFormateada: string | null
  cantidadPagada: string | null
  nombrePromovente: string | null
  descripcionSuceso: string | null
  fechaRecepcion: string | null
  fechaCierreAcuerdo: string | null
  cierreAcuerdo: string | null
  susceptibleConvenio: string | null
  fechaCierreAcuerdoFormateada: string | null
  fechaNotificacionResolucion: string | null
  revocoResolucionFechaCumplimiento: string | null
  fechaNotificacionResolucionFormateada: string | null
  revocoResolucionFechaCumplimientoFormateada: string | null
  expediente: string | null
  nss: string | null
  ooadInvolucrado: string | null
  unidadInvolucrada: string | null
  estado: string | null
}