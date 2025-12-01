import {Documento, Participacion} from "./datosDocumento";
import {DatosPersonales} from "./datosPersonales";
import {ResponseGeneral} from "./responseGeneral";


export class FotografiaRequest {

    datosPersonales!: DatosPersonales;
    fotografia!: Fotografia;
}

export class FotografiaResponse{
    participacion!: Participacion;
    datosPersonales!: DatosPersonales;
    fotografia!: Fotografia
}


export class Fotografia {
    idFotografia!: number;
    documento!: Documento;

}

export class DataFotografia extends ResponseGeneral{
 respuesta!: FotografiaResponse;
}


