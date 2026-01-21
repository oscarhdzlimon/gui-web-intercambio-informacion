export interface RespuestaInternaAntecedentes {
  listaPorNss: RegistroInternoAntecedentes[],
  listaPorNombre: RegistroInternoAntecedentes[],
  totalesGenerales: RespuestaTotales
}

interface RegistroInternoAntecedentes {
  nss: string,
  numId: number,
  nombreFull: string,
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string,
  totalesProcedimiento: RespuestaTotales,
  totalTodos: number
}

interface RespuestaTotales {
  RP: number,
  JF: number,
  IC: number,
  "Queja de servicio": number,
  MAI: number,
  Gestion: number
}
