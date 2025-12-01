import {EstatusVerificacion} from "./aspirante"
import {DatosPersonales} from "./datosPersonales";

export class DatosDocumentoResponse {

    participacion!: Participacion;
    datosPersonales!:DatosPersonales;
    documentosCargados!:Array<DatosDocumento>;


}


export class Participacion{
    idParticipacion!: number;
    idUsuario!: number;
    idConvocatoria!: number;
    resultadoVerificacion!: ResultadoVerificacion;
}

export class ResultadoVerificacion{

        idResultadoVerificacion!: number;
        estatusVerificacion!:EstatusVerificacion;
        refObservaciones!: string;

}

export class DatosDocumento{
    idDocumentoCargado!: number;
    refTipodocCargado!: string;
    documentoObligatorio!: DocumentoObligatorio;
    tipoDocumentoEspecialidad!: any;
    refConstancia!: string;
    documento!: Documento;
}

export class Documento{
    refGuid!: string;
    refNombre!: string;
    refExtension!: string;
}
export class DocumentoObligatorio{
    idDocumentoObligatorio!: number;
    desDocumentoObligatorio!: string;
}
