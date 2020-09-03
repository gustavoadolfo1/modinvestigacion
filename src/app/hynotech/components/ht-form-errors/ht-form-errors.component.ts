import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-ht-form-errors',
  templateUrl: './ht-form-errors.component.html',
  styleUrls: ['./ht-form-errors.component.scss']
})
export class HtFormErrorsComponent implements OnInit {
    @Input() control = null;
  constructor() { }

  ngOnInit() {
  }

}
