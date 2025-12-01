import {CatPerfil, CatSubperfil} from "./catalogoGeneral";
import {Estado, Pais} from "./datosDomicilio";
import {EstadoCivil} from "./estadoCivil";

import {Sexo} from "./sexo";

export class DatosPersonales{
    idUsuario!: number;
    cveMatricula!: string;
    stpAltaRegistro!: string;
    nomNombre!: string;
    nomApellidoPaterno!: string;
    nomApellidoMaterno!: string;
    refCurp!: string;
    refRfc!: string;
    refNss!: string;
    fecNacimiento!: string;
    paisNacimiento!: Pais;
    sexo!: Sexo;
    lugarNacimiento!: Estado;
    estadoCivil!: EstadoCivil;
    refPasaporte!: string;
    perfil!: CatPerfil;
    subperfil!: CatSubperfil;


}

