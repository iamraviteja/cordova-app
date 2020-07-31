import { Component, OnInit } from '@angular/core';

import { ActionSheetController, ToastController, Platform } from '@ionic/angular';
import { Health } from '@ionic-native/health/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{

  constructor(
    private health: Health,
    private toastController: ToastController
    ) {}

  ngOnInit(): void{
    
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      buttons: [
        {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }

  initHealthApi(): void{
    this.health.isAvailable()
    .then((available:boolean) => {
      this.presentToast(`is available :: ${available}`);
      this.health.requestAuthorization([
        'distance', 'nutrition',  //read and write permissions
        {
          read: ['steps'],       //read only permission
          write: ['height', 'weight']  //write only permission
        }
      ])
      .then(res => this.presentToast(JSON.stringify(res)))
      .catch(e => this.presentToast(JSON.stringify(e)));
    })
    .catch(e => this.presentToast(JSON.stringify(e)));
  }
}
