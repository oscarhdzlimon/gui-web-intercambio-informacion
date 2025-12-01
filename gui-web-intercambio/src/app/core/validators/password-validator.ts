import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";
import {PATRON_CARACTER_ESPECIAL, PATRON_LETRA_MAYUSCULA, PATRON_LETRA_MINUSCULA, PATRON_NUMERO} from "@utils/regex";

export function passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

        const value = control.value || '';
        const errores: any = {};
        if (value.length < 8) {
            errores.minLength = true;
        }
        if (value.length > 12) {
            errores.maxLength = true;
        }
        if (!PATRON_LETRA_MAYUSCULA.test(value)) {
            errores.mayuscula = true;
        }
        if (!PATRON_LETRA_MINUSCULA.test(value)) {
            errores.minuscula = true;
        }
        if (!PATRON_NUMERO.test(value)) {
         errores.numero = true;
        }
        if(!PATRON_CARACTER_ESPECIAL.test(value)){
            errores.caracter = true;
        }
        return Object.keys(errores).length ? errores : null;
    };
  }
