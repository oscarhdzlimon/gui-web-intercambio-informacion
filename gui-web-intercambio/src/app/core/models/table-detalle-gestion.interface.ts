export interface TablaDetalleGestionInterface {

   /* idConsecutivo: number,
    idExpediente: string,
    personaPromovente: string | null,
    strCurp: string | null,
    strNSS: string | null,
    fchSuceso: string | null,
    strDescripcionSuceso: string | null,
*/


    folio:string | null ,
    nombrePeticionario: string,
    fechaSuceso: string,
    fechaCreacion: string,
    fechaCierre: string,
    consecutivo: string | null,
    nombreAfectado: string,
    nss: string,
    ooadInvolucrado: string,
    unidadInvolucrada: string,
    estado: string,
    personaPromovente: string
    
  }