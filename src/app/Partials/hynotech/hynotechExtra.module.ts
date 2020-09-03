import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressComponent } from './progress/progress.component';


import {DateTimePickerComponent} from './date-time-picker/date-time-picker.component';
import {FormsModule} from '@angular/forms';
import {NgbDatepickerModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {FormErrorsComponent} from './form-errors/form-errors.component';
import {HynotechModule} from '../../hynotech/hynotech.module';


@NgModule({
  declarations: [ ProgressComponent, DateTimePickerComponent, FormErrorsComponent],
  exports: [
    ProgressComponent,
    DateTimePickerComponent,
    FormErrorsComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        NgbDatepickerModule,
        NgbModule,
        HynotechModule,
    ]
})
export class HynotechExtraModule { }
