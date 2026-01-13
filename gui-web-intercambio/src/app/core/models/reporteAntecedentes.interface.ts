export interface ReporteAntecedentes{
    expediente: string | null,
    tipoBusqueda: number | null,
    nombre: string,
    apellidoPaterno: string | null,
    apellidoMaterno: string | null,
    nss: string,
    fecCorteSiade: string,
    fecCorteSsc1: string,
    fecCorteSsc2: string,
    nombreConsultor: string,
    ooad: string,
    aplicativoOrigen: string,
    moduloOrigen: string   
}