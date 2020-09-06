import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { ExploreContainerComponent } from "../explore-container/explore-container.component";

@Component({
  selector: 'app-ion-nav-page',
  templateUrl: './ion-nav-page.page.html',
  styleUrls: ['./ion-nav-page.page.scss'],
})
export class IonNavPagePage implements OnInit, AfterViewInit {

  @ViewChild('pageNav') pageNavInstance: IonNav;

  @Input() sampleParam: string;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    console.log(this.sampleParam);
    this.pageNavInstance.push(ExploreContainerComponent, { name: this.sampleParam});
  }

}
