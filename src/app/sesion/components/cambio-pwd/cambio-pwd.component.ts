import {Component, OnInit} from '@angular/core';
import {SharedAnimations} from '../../../shared/animations/shared-animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {formatDate} from '@angular/common';
import {FormValidators} from '../../../hynotech/form-validators';
import {QueryServices} from '../../../servicios/query.services';
import swal from 'sweetalert2';
import {DataServices} from '../../../servicios/data.services';
import {Router} from '@angular/router';

@Component({
    selector: 'app-perfil',
    templateUrl: './cambio-pwd.component.html',
    styleUrls: ['./cambio-pwd.component.scss'],
    animations: [SharedAnimations]
})
export class CambioPwdComponent implements OnInit {



    enviandoFormulario = false;

    frmActualizar: FormGroup;

    get frmActualizarControl() {
        return this.frmActualizar.controls;
    }

    constructor(
        private _dataService: DataServices,
        private queryTramite: QueryServices,
        private formBuilder: FormBuilder,
        private router: Router
    ) {
        if (!localStorage.getItem('unamToken') && !JSON.parse(localStorage.getItem('unamToken'))['access_token'] ) {
            // this.router.navigateByUrl('sessions/signin');
            this.router.navigateByUrl('/sesion/inicio');
        }
    }

    async ngOnInit() {

        this.crearFormulario();

        this.queryTramite.datosTramitesServidor({
            tipo: 'contactos_persona',
            data: [this._dataService.getOption().credencialActual.iPersId]
        }).subscribe(dat => {
            this.frmActualizarControl.celular.setValue(dat[0].cTelefonoMovil);
            this.frmActualizarControl.email.setValue(dat[0].cCorreoElectronico);
        });

    }

    crearFormulario() {
        const fechaActual = new Date();
        this.frmActualizar = this.formBuilder.group({
            celular: ['', Validators.required],
            email: ['', Validators.required],
            new_password: ['', [
                Validators.required,
                Validators.minLength(8),
                // FormValidators.patternValidator(/\d/, { hasNumber: true }),
                FormValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
                FormValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
                // FormValidators.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { hasSpecialCharacters: true }),
            ]],
            re_new_password: ['', Validators.required],

                auditoria: this.formBuilder.group({
                    credencial_id: '',
                    nombre_equipo: '',
                    ip: '',
                    mac: '',
                }),
        },
            {
                validator: FormValidators.passwordMatchValidator
            });

    }

    async enviarFormulario(tipo_form) {
        let frmTratarControl = null;
        let frmTratar = null;
        switch (tipo_form) {
            case 'actualizarDatosInicial':
                frmTratarControl = this.frmActualizarControl;
                frmTratar = this.frmActualizar;
                break;
        }

        if (frmTratarControl != null) {

            frmTratarControl.auditoria.patchValue({
                credencial_id: this._dataService.getOption().credencialActual.iCredId,
                ip: this._dataService.getOption().ip.publico + ' / ' + this._dataService.getOption().ip.local,
            });



            this.enviandoFormulario = true;
            if (frmTratar.invalid) {
                // this.formErrors = this.FormService.validateForm(this.signUpForm, this.formErrors, false)
                await swal.fire({
                    title: 'Error:',
                    text: 'Faltan datos en el formulario. por favor verifique',
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
                this.enviandoFormulario = false;
                return false;
            } else {
                const retorno = await this.queryTramite.guardarDatosAsync({
                    tipo: tipo_form,
                    data: frmTratar.value
                });
                // @ts-ignore
                if (!retorno.error) {
                    this.router.navigateByUrl('/');
                }
            }
            this.enviandoFormulario = false;
        }
    }
}
