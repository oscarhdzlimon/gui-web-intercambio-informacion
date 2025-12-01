import {CatDocumentoVerificacion, CatPerfil} from "./catalogoGeneral";

export class Medico {
  nomNombre!: string;
  nomApellidoPaterno!: string;
  nomApellidoMaterno!: string;
  refCurp!: string;
  refRfc!: string;
  refEmail!: string;
  refContrasenaHash!: string;
  modalidad!: number;
  perfil1!: number
  nomPerfil!: string;
  perfil!: CatPerfil;
  blnInterno!: boolean;
  desDocumentoVerificacion!: string;
  documentoVerif!: CatDocumentoVerificacion;
}


export class RegistroMedico extends Medico {
  correo2!: string;
  password2!: string;
  blnPasaporte!: boolean;
  pais!: number;
  pasaporte!: string;
  cveMatricula!: string;
}


export class RegistroInternoRequest {
  
  refEmail!: string;
  refContrasenaHash!: string;
  idPerfil!: number;
  cveMatricula!: string;
  nomNombre!: string;
  nomApellidoPaterno!: string;
  nomApellidoMaterno!: string;
  refCurp!: string;
  refRfc!: string;
  areaMedicaData!: AreaMedicaData;
  renapoData!:RenapoData;
  requiereFolio!: boolean;
  
}

export class RegistroCurpRequest {
  refEmail!: string;
  refContrasenaHash!: string;
  idPerfil!: number;
  idSubperfil!: number;
  idDocumentoVerificacion!: number;
  nomNombre!: string;
  nomApellidoPaterno!: string;
  nomApellidoMaterno!: string;
  refCurp!: string;
  refRfc!: string;
  requiereFolio!: boolean;
  areaMedicaData!: AreaMedicaData;
}

export class RegistroPasaporteRequest {
  refEmail!: string;
  refContrasenaHash!: string;
  idPerfil!: number;
  idSubperfil!: number;
  idDocumentoVerificacion!: number;
  pasaporte!: string;
  idPaisEmision!: number;
  nomNombre!: string;
  nomApellidoPaterno!: string;
  nomApellidoMaterno!: string;
  refCurp!: string;
  refRfc!: string;
}


export class AreaMedicaData{
  lugar!: string;
  valor_orden!:string;
  CURP!: string;
  APELLIDO_PATERNO!: string;
  APELLIDO_MATERNO!: string;
  NOMBRE!:string;
  ESPECIALIDAD!: string;
  SEDE!:string;
  R1!:string;
  R2!:string;
  R3!:string;
  R4!:string;
  R5!:string;
  R6!:string;
  PROMEDIO!:string;
  ERC!:string;
  LIDER_ERC!:string;
  PT_BIENESTAR!:string;
  MENINGITIS!:string;
  PUNTAJE_CONTRATACION!: string;
  ENARM!:string;
  LICENCIATURA!: string;
  PROMEDIO_EyL!:string;
  TIPO_CONTRATACION!: string;
  MATRICULA!:string;
  CATEGORIA!: string;
  TIPO_ESPECIALIDAD!:string;
  TIPO!:string;

}

export class RenapoData{

}