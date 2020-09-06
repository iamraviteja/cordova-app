import { Component, OnInit } from '@angular/core';

import { ActionSheetController, ToastController, Platform } from '@ionic/angular';
import { Health } from '@ionic-native/health/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';

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
    private toastController: ToastController
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
