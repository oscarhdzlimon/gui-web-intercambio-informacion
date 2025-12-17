import {ConfigEnvironment} from '@models/config-environment.interface';

const base: string = 'http://10.166.0.120:1059/';

export const environment: ConfigEnvironment = {
  production: false,
  api: {
    login: base + 'msinif-autenticacion/api/',
    apiCatalogos: 'http://10.166.120:1054/mscme-catalogos/api',
    apiRegistro: 'http://10.166.120:1053/mscme-registro/api',
    apiConvocatoria: 'http://10.166.120:1056/mscme-convocatoria/api',
    apiDocumentos: 'http://10.166.120:1057/mscme-documentos/api',
    apiAntecedentes: 'http://10.166.0.120:1060/msinif-antecedentes/api/v1/',
    apiBitacora: 'http://10.166.0.120:1060/msinif-antecedentes/api/',
  }
}

