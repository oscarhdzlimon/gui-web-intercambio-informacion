export interface AdjuntoOpinion {
    nombreAdjunto: string;
    adjuntoBase64: string; 
}

// 2. Interfaz principal para la respuesta del servicio
export interface OpinionTecnicaRespuesta { // Cambié el nombre para mayor claridad
    exito: boolean;
    mensaje: string;
    respuesta: AdjuntoOpinion[]; // <-- Ahora es un ARREGLO de AdjuntoOpinion
}