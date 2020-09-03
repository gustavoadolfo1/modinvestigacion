import { Component, OnInit } from '@angular/core';
import {LoaderService} from '../../services/loader.service';

@Component({
  selector: 'app-ht-loader',
  templateUrl: './ht-loader.component.html',
  styleUrls: ['./ht-loader.component.scss']
})
export class HtLoaderComponent implements OnInit {

    loading: boolean;
    constructor(private loaderService: LoaderService) {
        this.loaderService.isLoading.subscribe((v) => {
            // this.loading = v;
            Promise.resolve(null).then(() =>  this.loading = v);
        });
    }

  ngOnInit() {
  }

}
