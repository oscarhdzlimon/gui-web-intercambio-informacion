import {InteresLaboral} from "./aspirante";
import {DatosContacto} from "./datosContacto";
import {Participacion} from "./datosDocumento";
import {Residencia} from "./datosDomicilio";
import {DatosPersonales} from "./datosPersonales";
import {Dependientes} from "./dependiente";
import {ResponseGeneral} from "./responseGeneral";

export class DatosGeneralesRequest {
  datosPersonales!: DatosPersonales;
  dependientes!: Dependientes;
  datosContacto!: DatosContacto;
  datosResidenciaActual!: Residencia;
  zonasInteresLaboral!: Array<InteresLaboral>;
}

export class DatosGeneralesResponse {
  participacion!: Participacion;
  datosPersonales!: DatosPersonales;
  dependientes!: Dependientes;
  datosContacto!: DatosContacto;
  datosResidenciaActual!: Residencia;
  zonasInteresLaboral!: Array<InteresLaboral>;
}

export class dataGenerales extends ResponseGeneral {
  respuesta!: DatosGeneralesResponse;
}

