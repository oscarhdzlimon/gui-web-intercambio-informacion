import {ResolveFn} from '@angular/router';
import {CatalogosGeneralesService} from '@services/catalogos-generales.service';
import {inject} from '@angular/core';
import {forkJoin} from 'rxjs';

export const ofertaLaboralResolver: ResolveFn<any> = (route, state) => {
  const catalogosService = inject(CatalogosGeneralesService);
  const ooad = catalogosService.getLstOOADS();

  const especialidad = catalogosService.getLstEspecialidades();
  const regimen = catalogosService.getLstRegimen();
  const bono = catalogosService.getLstBono();
  const preguntasFrecuentes = catalogosService.getLstPreguntas();

  return forkJoin([ooad, especialidad, regimen, bono, preguntasFrecuentes]);
};
