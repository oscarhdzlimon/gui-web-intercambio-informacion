export interface RespuestaInternaAntecedentes {
  listaPorNss: RegistroInternoAntecedentes[],
  listaPorNombre: RegistroInternoAntecedentes[],
  totalesGenerales: RespuestaTotales
}

export interface RegistroInternoAntecedentes {
  nss: string,
  numId: number,
  nombreFull: string,
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string,
  totalesProcedimiento: RespuestaTotales,
  totalTodos: number
}

export interface RespuestaTotales {
  rp: number,
  jf: number,
  ic: number,
  queja_de_servicio: number,
  mai: number,
  gestion: number
}
