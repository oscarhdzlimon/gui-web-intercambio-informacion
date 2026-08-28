export interface ConfigEnvironment {
  production: boolean;
  api: {
    login: string;
    apiAntecedentes: string;
    apiBitacora: string;
    sscv1: string;
  },
  key: {
    AES_KEY_BASE64: string,
    CAPTCHA: string
  }
}
