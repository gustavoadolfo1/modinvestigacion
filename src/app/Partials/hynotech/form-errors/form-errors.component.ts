import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ht-form-errors',
  templateUrl: './form-errors.component.html',
  styleUrls: ['./form-errors.component.scss']
})
export class FormErrorsComponent {
  @Input() control = null;
  constructor() { }
}
