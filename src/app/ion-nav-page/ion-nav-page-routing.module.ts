import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IonNavPagePage } from './ion-nav-page.page';

const routes: Routes = [
  {
    path: '',
    component: IonNavPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IonNavPagePageRoutingModule {}
