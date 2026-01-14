export interface RegistroAntecedentes {
  idBitacoraAsociacion: number | null;
  indAsociado: boolean;
  idPersona: string,
  nss: string;
  nombre: string;
  expediente: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  gestion: number;
  quejaMedica: number;
  amparoIndirecto: number;
  juicioContencioso: number;
  inconformidades: number;
  procedimientoRpe: number;
}
