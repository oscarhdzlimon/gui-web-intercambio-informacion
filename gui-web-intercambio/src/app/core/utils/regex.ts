export const PATRON_CARACTER_ESPECIAL = /[!@#$%^&*(),.?":{}|<>-]/;
export const PATRON_LETRA_MAYUSCULA = /[A-Z]/;
export const PATRON_LETRA_MINUSCULA = /[a-z]/;
export const PATRON_NUMERO = /\d/;
export const PATRON_CARACTERES_ASCII = /^[\x21-\x7EñÑ]$/;// Patrón que permite solo caracteres ASCII imprimibles sin espacios (0x21 a 0x7E)
export const PATRON_CURP = /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
export const PATRON_RFC = /^([A-ZÑ\x26]{3,4}(\d{2})(0[1-9]|1[0-2])(0[1-9]|1\d|2\d|3[0-1]))([A-Z\d]{3})?$/;
export const PATRON_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+){0,5}(?:\s+[-\sa-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)?$/
/* export const PATRON_MATRICULA = /^\d{10}$/ */
/* Maximo 10 caracteres */
export const PATRON_MATRICULA = /^\d{1,10}$/;
export const PATRON_EMAIL = /^[-\w.%+=_*']{1,64}@(?:[a-z0-9-]{1,63}\.){1,125}[a-z]{2,63}$/
export const PATRON_PASAPORTE = /^[A-Z0-9]{6,9}$/
