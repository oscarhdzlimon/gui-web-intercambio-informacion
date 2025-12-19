export interface SolicitudBitacora {
  // de la url o session segun caso
  refOoad: string,
  refUsuarioAutentica: string,
  refAplicativo: string,
  refModulo: string,

  //filtros de la busqueda
  refExpediente: string | null,
  // va cambiar cuando se separe el nombre
  nomPersona: string,
  nomApellidoPaterno: null,
  nomApellidoMaterno: null,
  refNss: string | null,

  // vendra de otro servicio aun pendintes
  fecCorteSsc1: string,
  fecCorteSsc2: string,
  fecCorteSiade: string
}
