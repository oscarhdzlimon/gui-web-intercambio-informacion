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
  RP: number,
  JF: number,
  IC: number,
  "Queja de servicio": number,
  MAI: number,
  Gestion: number
}
