import { async } from '@angular/core/testing';

import { ModalController } from '@ionic/angular';
import { IonNavPagePage } from "../ion-nav-page/ion-nav-page.page";

export const presentModal: Function = async (modalController: ModalController) => {
    const modal = await modalController.create({
        component: IonNavPagePage,
        cssClass: 'my-custom-class',
        componentProps:{
          sampleParam: 'hey this is sample'
        }
      });
      
    await modal.present();
}