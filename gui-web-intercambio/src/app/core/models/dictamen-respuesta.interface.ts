export interface DictamenRespuesta {
    exito: boolean; // Necesitas validar esto
    mensaje: string;
    respuesta: {
        nombreAdjunto: string;
        adjuntoBase64: string; // El string Base64 del PDF
    };
}