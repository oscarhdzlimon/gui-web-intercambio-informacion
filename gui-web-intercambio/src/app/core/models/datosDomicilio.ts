import {Participacion} from "./datosDocumento";
import {ResponseGeneral} from "./responseGeneral";
import {Colonia} from "./colonia";
import {DatosPersonales} from "./datosPersonales";


export class DatosDomicilio {
  participacion!: Participacion;
  datosPersonales!: DatosPersonales;
  datosResidenciaActual!: Residencia;
}

export class DataDomicilio extends ResponseGeneral {
  respuesta!: DatosDomicilio;
}

export class Residencia {
  colonia!: Colonia;
  nomCalle!: string;
  refNumero!: string;
  codigoPostal!: string;
  pais!: Pais;
  estado!: Estado;
  delegacion!: Municipio;
  calle!: string;
  numeroExterior!: string;
}

export class ResidenciaRequest {
  datosPersonales!: DatosPersonales;
  datosResidenciaActual!: Residencia;
}

export class Pais {
  idPais!: number;
  cvePais!: string;
  desPais!: string;
  nomPaisNacimiento!: string;
}

export class Estado {
  idEstado!: number;
  desEstado!: string;
  idLugarNacimiento!: number;
  desLugarNacimiento?: string;
}

export class Municipio {
  idMunicipio!: number;
  desMunicipio!: string;
}
