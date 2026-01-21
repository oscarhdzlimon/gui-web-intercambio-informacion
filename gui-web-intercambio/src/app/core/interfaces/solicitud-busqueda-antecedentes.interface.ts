export interface SolicitudBusquedaPaginado {
  personas: ({ cve_nss: string } | Persona )[]
  expediente: string | null,
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

export interface NuevaSolicitudBusquedaPaginado {
  personas: NuevaPersona[]
  expediente: string | null,
  ooad_UMAE: string,
  usuarioLogueado: string,
  sistema: string,
  modulo: string
}

interface NuevaPersona {
  nss: string,
  nombre: string,
  apellidoPaterno: string,
  apellidoMaterno: string
}
