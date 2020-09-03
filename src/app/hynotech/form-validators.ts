import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import {ValidateFn} from 'codelyzer/walkerFactory/walkerFn';
import {QueryServices} from '../servicios/query.services';

// setup simple regex for white listed characters
const validCharacters = /[^\s\w,.:&\/()+%'`@-]/;

// create your class that extends the angular validator class
export class FormValidators extends Validators {

    static validarDatoExiste(tabla: string, campo: string, queryTramite: QueryServices): AsyncValidatorFn {
        return async (control: AbstractControl): Promise<{ [key: string]: any } | null> => {
            // if control value is not null and is a number
            if (control.value && control.value.length > 0) {
                const val = await queryTramite.verificarSiExiste(tabla, campo, control.value);
                // console.log(val);

                // @ts-ignore
                return val.error ? { data_existe: val.msg } : null;
            }
            return null;
        };
    }

    // create a static method for your validation
    static validateCharacters(control: FormControl) {

        // first check if the control has a value
        if (control.value && control.value.length > 0) {

            // match the control value against the regular expression
            const matches = control.value.match(validCharacters);

            // if there are matches return an object, else return null.
            return matches && matches.length ? { invalid_characters: matches } : null;
        } else {
            return null;
        }
    }

    static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (!control.value) {
                // if control is empty return no error
                return null;
            }

            // test the value of the control against the regexp supplied
            const valid = regex.test(control.value);

            // if true, return no error (no error), else return error passed in the second parameter
            return valid ? null : error;
        };
    }

    static passwordMatchValidator(control: AbstractControl) {
        const password: string = control.get('new_password').value; // get password from our password form control
        const confirmPassword: string = control.get('re_new_password').value; // get password from our confirmPassword form control
        // compare is the password math
        if (password !== confirmPassword) {
            // if they don't match, set an error in our confirmPassword form control
            control.get('re_new_password').setErrors({ NoPassswordMatch: true });
        }
    }
}
