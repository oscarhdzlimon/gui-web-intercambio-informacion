export interface BusquedaInternaNombre {
  nombre: string,
  apPaterno: string,
  apMaterno: string,
}

export interface BusquedaInternaNombreNSS extends BusquedaInternaNombre {
  nss: string,
}
