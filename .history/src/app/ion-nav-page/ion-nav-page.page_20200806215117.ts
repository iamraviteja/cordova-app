import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { ExploreContainerComponent } from "../explore-container/explore-container.component";

@Component({
  selector: 'app-ion-nav-page',
  templateUrl: './ion-nav-page.page.html',
  styleUrls: ['./ion-nav-page.page.scss'],
})
export class IonNavPagePage implements OnInit, AfterViewInit {

  @ViewChild('pageNav') ionNav: IonNav;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.ionNav.push(ExploreContainerComponent);
  }

}
