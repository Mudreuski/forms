import {AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn} from '@angular/forms';
import {catchError, debounceTime, map, Observable, of, switchMap} from 'rxjs';
import {UserFormService} from '../../components/form-container/services/user-form.service';
import {AvailableCountries} from '../enum/country';

export function countryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || AvailableCountries.includes(control.value)) {
      return null;
    } else {
      return { invalidCountry: true };
    }
  };
}

export function birthdayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    } else {
      const today = new Date();
      const selectedDate = new Date(control.value);

      return selectedDate > today ? { invalidBirthday: true } : null;
    }
  };
}

export function usernameValidator(userFormService: UserFormService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return of(control.value).pipe(
      debounceTime(300),
      switchMap((username) => {
        return userFormService.checkUsername(username).pipe(
          map((response) => response.isAvailable ? null : { invalidUsername: true }),
          catchError(() => of(null))
        );
      }),
    );
  };
}
