export interface SolicitudBusquedaPaginado {
  personas: ({ cve_nss: string } | Persona )[]
  expediente: string,
  ooad_UMAE: string,
  usuarioLogueado: string,
  sistema: string,
  modulo: string
}

interface Persona {
  nom_nombre_afectado: string,
  nom_apellido_paterno_afectado: string,
  nom_apellido_materno_afectado: string
}
