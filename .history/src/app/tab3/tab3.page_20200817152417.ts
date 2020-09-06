import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { ActionSheetController, ToastController, Platform, ModalController } from '@ionic/angular';
import { Health } from '@ionic-native/health/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';

import { presentModal } from './common';

import { TouchAuth } from "../shared/touch-auth/touch-auth";

declare var cordova: any;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  private fileTransfer: FileTransferObject;
  private downloadLink =
    "https://www.transamerica.com/media/Privacy-Statement_tcm145-107975.pdf";
  public fileName: string = 'Privacy-Statement_tcm145-107975.pdf';
  private options: DocumentViewerOptions = {
    title: 'My PDF'
  }

  constructor(
    private health: Health,
    private document: DocumentViewer,
    private transfer: FileTransfer,
    public file: File,
    private toastController: ToastController,
    private router: Router,
    public modalController: ModalController,
    private touchAuth: TouchAuth
    ) {}

  ngOnInit(): void{
    this.fileTransfer = this.transfer.create();
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

  public onBiometricTapped(): void{
    const MSG_ON = 'The fingerprint auth type for android is available';
    const MSG_OFF = 'The fingerprint auth type for android is not available';
    const { isTouchAvalible, isFingerprintAuthAvailable } = this.touchAuth.getTouchAvaliability();
    let message = isTouchAvalible && isFingerprintAuthAvailable ? MSG_ON : MSG_OFF ;
    this.presentToast(message);
  }

  public onIabTapped(): void{
    console.log('LOAD URL');
    const ref = cordova.InAppBrowser.open('../../assets/test.html', '_self', 'location=yes');
    ref.addEventListener('loadstop', (event) =>{
      console.log('EVENT URL ::', event.url);
      ref.executeScript({ 
          code: "\
          localStorage.setItem('testvar', 'Loaded test key');\
          document.getElementById('msg').innerText = 'app updated..'" 
      });
      ref.show();
    });
  }

  goToPdfViewer(){
    this.router.navigate(['/pdf-viewer']);
  }

  async goToIonNavPage(){
    // this.router.navigate(['/ion-nav-page']);
    presentModal(this.modalController);
  }

  getDownloadPath(dir: string, name: string): string {
    return dir + name;
  }

  public viewDocument():void{
    try{
      this.fileTransfer
      .download(this.downloadLink, this.getDownloadPath(this.file.externalDataDirectory, this.fileName))
      .then(
        (entry) => {
          this.presentToast("download complete for email: " + entry.toURL());      
          this.document.viewDocument(entry.toURL(), 'application/pdf', this.options);
        },
        (error) => {
          // handle error
          this.presentToast(JSON.stringify(error));
        }
      );
    }catch(err){
      this.presentToast(JSON.stringify(err));
    }

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
