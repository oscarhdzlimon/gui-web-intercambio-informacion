import {ResolveFn} from '@angular/router';
import {CatalogosGeneralesService} from '@services/catalogos-generales.service';
import {inject} from '@angular/core';
import {forkJoin} from 'rxjs';

export const inicioResolver: ResolveFn<any> = (route, state) => {
  const catalogosService = inject(CatalogosGeneralesService);
  const sexos = catalogosService.getLstSexos();
  const estadosCiviles = catalogosService.getLstEstadosCiviles();
  const paises = catalogosService.getLstPais();
  const lugaresNacimiento = catalogosService.getLstLugarNacimiento();
  const tiposDocumentos = catalogosService.getLstTiposDocumentos();
  const ooad = catalogosService.getLstOOADS();
  const especialidades = catalogosService.getLstEspecialidades();
  const dias = catalogosService.getLstDiasSemana();

  return forkJoin([sexos, estadosCiviles, paises, lugaresNacimiento, tiposDocumentos, ooad, especialidades, dias]);
};
