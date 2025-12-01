import {ConfigEnvironment} from '@models/config-environment.interface';

const base: string = 'http://10.166.120:1052/';

export const environment: ConfigEnvironment = {
  production: false,
  api: {
    login: base + 'mscme-autenticacion/api/',
    apiCatalogos: 'http://10.166.120:1054/mscme-catalogos/api',
    apiRegistro: 'http://10.166.120:1053/mscme-registro/api',
    apiConvocatoria: 'http://10.166.120:1056/mscme-convocatoria/api',
    apiDocumentos: 'http://10.166.120:1057/mscme-documentos/api'
  }
}

