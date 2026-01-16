export interface ConfigEnvironment {
  production: boolean;
  api: {
    login: string;
    apiCatalogos: string;
    apiRegistro: string;
    apiConvocatoria: string;
    apiDocumentos: string;
    apiAntecedentes: string;
    apiBitacora: string;
  },
  key: {
    AES_KEY_BASE64: string
  }
}
