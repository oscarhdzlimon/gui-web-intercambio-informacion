import {ConfigEnvironment} from '@models/config-environment.interface';


const base: string = '/';


export const environment: ConfigEnvironment = {
  production: false,
  api: {
    login: base + 'msinif-autenticacion/api/',
    apiAntecedentes: base + 'msinif-antecedentes/api/v1/',
    apiBitacora: base + 'msinif-antecedentes/api/',
    sscv1: base + 'msinif-sscv1/api/v1/antecedentes/sscv1/',
  },
  key: {
    AES_KEY_BASE64: 'mZzG9Fz9P0n4z7mZlKz8B9nX0mJ8vF7PZKX2vZx5QmE',
    CAPTCHA: '6LfNA1csAAAAAKB3LC6WBVtrI0xLRPxclzcA80bD'
  }
}
