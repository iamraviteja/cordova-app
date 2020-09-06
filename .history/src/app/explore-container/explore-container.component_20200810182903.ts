import { Component, OnInit, Input } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { IonDatetime } from '@ionic/angular';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;

  constructor(private network: Network) {  }

  ngOnInit() {}

}
