import { Component, OnInit, Input } from '@angular/core';
import { IonDatetime } from '@ionic/angular';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent extends IonDatetime implements OnInit {
  @Input() name: string;

  constructor() { super(); }

  ngOnInit() {}

}
