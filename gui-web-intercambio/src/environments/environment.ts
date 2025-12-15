import {ConfigEnvironment} from '@models/config-environment.interface';

const base: string = 'http://10.166.120:1052/';

export const environment: ConfigEnvironment = {
  production: true,
  api: {
    login: base + 'mscme-autenticacion/api/',
    apiCatalogos: base + 'mscme-catalogos/api',
    apiRegistro: base + 'mscme-registro/api',
    apiConvocatoria: base + '/mscme-convocatoria/api',
    apiDocumentos: "",
    apiAntecedentes: 'http://10.166.120:1060/' + 'msinif-antecedentes/api/v1/'
  }
}

