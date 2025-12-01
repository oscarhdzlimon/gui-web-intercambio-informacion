import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

export const jornadaLaboralValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;
  const diaInicioControl = formGroup.get('diaInicio');
  const diaFinControl = formGroup.get('diaFin');

  if (!diaInicioControl || !diaFinControl || diaInicioControl.disabled || diaFinControl.disabled) {
    return null;
  }

  const diaInicio = diaInicioControl.value ? Number.parseInt(diaInicioControl.value, 10) : null;
  const diaFin = diaFinControl.value ? Number.parseInt(diaFinControl.value, 10) : null;

  if (diaInicio !== null && diaFin !== null) {
    if (diaFin < diaInicio) {
      diaFinControl.setErrors({ jornadaInvalida: true });
      return { jornadaInvalida: true };
    }

    if (diaFinControl.hasError('jornadaInvalida')) {
      delete diaFinControl.errors!['jornadaInvalida'];
      if (Object.keys(diaFinControl.errors!).length === 0) {
        diaFinControl.setErrors(null);
      }
    }
  }

  return null;
};
