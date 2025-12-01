import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

/**
 * Validador personalizado para asegurar que la hora de fin no sea anterior a la hora de inicio.
 * Asume que los valores de horarioInicio y horarioFin están en formato HH:MM (24 horas).
 */
export const horarioLaboralValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;
  const horarioInicioControl = formGroup.get('horarioInicio');
  const horarioFinControl = formGroup.get('horarioFin');

  if (!horarioInicioControl || !horarioFinControl || horarioInicioControl.disabled || horarioFinControl.disabled) {
    return null;
  }

  const horarioInicio: string | null = horarioInicioControl.value;
  const horarioFin: string | null = horarioFinControl.value;

  // Si ambos tienen valor, compara
  if (horarioInicio && horarioFin) {
    // La comparación directa de strings funciona para el formato HH:MM
    if (horarioFin <= horarioInicio) {
      horarioFinControl.setErrors({ horarioInvalido: true });
      return { horarioInvalido: true };
    }

    // Limpia el error si la validación pasa
    if (horarioFinControl.hasError('horarioInvalido')) {
      delete horarioFinControl.errors!['horarioInvalido'];
      if (Object.keys(horarioFinControl.errors!).length === 0) {
        horarioFinControl.setErrors(null);
      }
    }
  }

  return null;
};
