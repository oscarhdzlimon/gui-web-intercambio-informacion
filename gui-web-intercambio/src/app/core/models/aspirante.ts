import {DatosPersonales} from "./datosPersonales";
import {InteresEspecialidad} from "./especialidad";
import {OOAD} from "./ooad";
import {Zona} from "./zona";

export class AspiranteRequest {
    idUsuarioAspirante!: number;
    estatusVerificacion!: Array<EstatusVerificacion>;
    refObservaciones!: string;
}


export class EstatusVerificacion {
    idEstatusVerificacion!: number;
    desEstatus?:string;
}



export class InteresLaboralRequest {
    datosPersonales!: DatosPersonales;
    interesEspecialidad!: InteresEspecialidad;
    interesOoads!: OOAD;
    interesZonas!:  Array<Zona>;

}


export class InteresLaboral{
    idInteresOoadZona?: number;
    idOoad?: number;
    desOoad!: string;
    cveOoad!: string;
    desZona!: string;
    cveZona!: string;
    ooad?:number;
    zonaInteres?:number;
}





