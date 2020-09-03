import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-ht-progress',
  templateUrl: './ht-progress.component.html',
  styleUrls: ['./ht-progress.component.scss']
})
export class HtProgressComponent implements OnInit {
  @Input() progress = 0;

  constructor() { }

  ngOnInit() {
  }

}
