import { Ordenamiento } from "./ordenamiento.enum";

export interface ParametrosInterface{
    page: number,
    size: number,
    sort: Ordenamiento
}