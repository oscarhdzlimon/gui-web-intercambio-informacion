import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { CatalogosGeneralesService } from "@services/catalogos-generales.service";
import { forkJoin } from "rxjs";

export const verficacionDocsResolver: ResolveFn<any> = (route, state) => {
  const catalogosService = inject(CatalogosGeneralesService);
  const especialidades = catalogosService.getLstEspecialidades();
  const estatusVerificacion = catalogosService.getLstEstatusVerificacion();


  return forkJoin([especialidades,estatusVerificacion]);
}
