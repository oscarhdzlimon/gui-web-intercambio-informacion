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
    apiAntecedentes: 'http://10.166.120:1060/' + 'msinif-antecedentes/api/v1/',
    apiBitacora: 'http://10.166.120:1060/' + 'msinif-antecedentes/api/',
    sscv1: 'http://10.166.120:1060/' + 'msinif-sscv1/api/v1/antecedentes/sscv1/',
  },
  key: {
    AES_KEY_BASE64: 'mZzG9Fz9P0n4z7mZlKz8B9nX0mJ8vF7PZKX2vZx5QmE',
    CAPTCHA: '6LfNA1csAAAAAKB3LC6WBVtrI0xLRPxclzcA80bD'
  }
}

