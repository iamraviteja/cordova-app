import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IonNavPagePageRoutingModule } from './ion-nav-page-routing.module';

import { IonNavPagePage } from './ion-nav-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonNavPagePageRoutingModule
  ],
  declarations: [IonNavPagePage]
})
export class IonNavPagePageModule {}
