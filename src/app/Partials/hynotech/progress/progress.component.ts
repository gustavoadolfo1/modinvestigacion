import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ht-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent {
  @Input() progress = 0;
  constructor() { }
}
