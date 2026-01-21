export interface TotalAntecedentes {
  rp: number;
  jf: number;
  ic: number;
  queja_de_servicio: number;
  mai: number;
  gestion: number;
}

export interface NuevoRegistroAntecedentes {
  nss: string;
  numId: number;
  nombreFull: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  totalesProcedimiento: TotalAntecedentes;
  totalTodos: number;
}

export interface RespuestaAntecedentes {
  // Record<string, NuevoRegistroAntecedentes[]> permite que las llaves sean cualquier string (el NSS o Nombre)
  resultadosPorNss: Record<string, NuevoRegistroAntecedentes[]>;
  resultadosPorNombre: Record<string, NuevoRegistroAntecedentes[]>;
  totalesGenerales: TotalAntecedentes;
}
