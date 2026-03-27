export interface ConsultaDescifrada {
  personas: Persona[]
  expediente: string,
  ooad_UMAE: string,
  usuarioLogueado: string,
  sistema: string,
  modulo: string,
  cveAsunto: string,
  perfil: string
}

interface Persona {
  cve_nss: string
  nom_nombre_afectado: string,
  nom_apellido_paterno_afectado: string,
  nom_apellido_materno_afectado: string
}
