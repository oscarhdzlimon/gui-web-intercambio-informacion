interface TotalAntecedentes {
  rp: number;
  jf: number;
  ic: number;
  queja_de_servicio: number;
  mai: number;
  gestion: number;
}

interface RegistroAntecedentes {
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
  // Record<string, RegistroAntecedentes[]> permite que las llaves sean cualquier string (el NSS o Nombre)
  resultadosPorNss: Record<string, RegistroAntecedentes[]>;
  resultadosPorNombre: Record<string, RegistroAntecedentes[]>;
  totalesGenerales: TotalAntecedentes;
}
