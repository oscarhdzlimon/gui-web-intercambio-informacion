export interface ConfigEnvironment {
  production: boolean;
  api: {
    login: string;
    apiCatalogos:string;
    apiRegistro:string;
    apiConvocatoria:string;
    apiDocumentos:string;
  }
}
