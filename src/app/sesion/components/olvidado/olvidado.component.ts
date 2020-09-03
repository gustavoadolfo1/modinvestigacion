import {Component, OnInit} from '@angular/core';
import {SharedAnimations} from '../../../shared/animations/shared-animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SesionService} from '../../services/sesion.service';
import {FormValidators} from '../../../hynotech/form-validators';
import {ActivatedRoute, Router} from '@angular/router';
import swal from "sweetalert2";

@Component({
    selector: 'app-olvidado',
    templateUrl: './olvidado.component.html',
    styleUrls: ['./olvidado.component.scss'],
    animations: [SharedAnimations]
})
export class OlvidadoComponent implements OnInit {
    frmRecuperar: FormGroup;

    retToken = false;
    tokenByUrl = null;

    constructor(
        private fb: FormBuilder,
        private sesionService: SesionService,
        private route: ActivatedRoute,
        private router: Router
    ) {
    }
    get frmRecuperarontrol() { return this.frmRecuperar.controls; }
    ngOnInit() {
        this.frmRecuperar = this.fb.group({
                dni: ['', [Validators.required, Validators.minLength(8)]],
                token: [''],
                new_password: [''],
                re_new_password: ['']
            },
            {
                validator: FormValidators.passwordMatchValidator
            });

        const datUrl = this.route.snapshot.paramMap;

        // this.tokenByUrl = this.route.snapshot.paramMap.get('token');
        if (datUrl.get('token')) {
            this.retToken = true;
            this.setValidators();
            this.frmRecuperarontrol.token.setValue(datUrl.get('token'));
            this.frmRecuperarontrol.dni.setValue(datUrl.get('dni'));
        }
    }

    enviarSolicitud() {
        if (this.frmRecuperar.valid) {
            this.sesionService.enviarData('/auth/forgot', this.frmRecuperar.value).subscribe(datRet => {
                console.log(datRet);
                if (!datRet['error']) {
                    this.retToken = true;
                    this.setValidators();

                    let timerInterval;


                    if (datRet['data']['retCambio']) {
                        swal.fire({
                            title: 'Bien!',
                            html: datRet['msg'] + '<br> Se cerrara en <strong> X </strong> segundos.',
                            type: 'success',
                            timer: 3000,
                            onBeforeOpen: () => {
                                swal.showLoading();
                                timerInterval = setInterval(() => {
                                    const impr = Math.ceil((swal.getTimerLeft() / 1000));
                                    swal.getContent().querySelector('strong').textContent = String(impr);
                                }, 100);
                            },
                            onClose: () => {
                                clearInterval(timerInterval);
                                if (datRet['data']['retCambio']) {
                                    this.router.navigateByUrl('sesion/inicio');
                                }
                            }
                        });
                    } else {
                        swal.fire({
                            title: 'Bien!',
                            html: datRet['msg'],
                            type: 'success',
                            confirmButtonText: 'Aceptar',
                        });
                    }
                }

            }, err => {
                console.log(err);
                swal.fire({
                    title: 'Error:',
                    text: err.error.message,
                    type: 'error',
                    confirmButtonText: 'Verificar',
                });
            });
        } else {
            swal.fire({
                title: 'Error:',
                text: 'Datos incompletos en el formulario',
                type: 'error',
                confirmButtonText: 'Verificar',
            });
        }
    }

    setValidators() {
        this.frmRecuperarontrol.token.setValidators([Validators.required]);
        this.frmRecuperarontrol.new_password.setValidators([
            Validators.required,
            Validators.minLength(8),
            // FormValidators.patternValidator(/\d/, { hasNumber: true }),
            FormValidators.patternValidator(/[A-Z]/, {hasCapitalCase: true}),
            FormValidators.patternValidator(/[a-z]/, {hasSmallCase: true}),
            // FormValidators.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { hasSpecialCharacters: true }),
        ]);
        this.frmRecuperarontrol.re_new_password.setValidators([Validators.required]);
    }
}
