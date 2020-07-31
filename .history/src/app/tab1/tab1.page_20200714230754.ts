import { Component, AfterViewInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements AfterViewInit{
  public errorString:string = 'No Errors';
  private fileTransfer: FileTransferObject;
  private url = 'https://www.transamerica.com/media/Privacy-Statement_tcm145-107975.pdf';
  constructor(
    public toastController: ToastController,
    private diagnostic: Diagnostic,
    private transfer: FileTransfer,
    public file: File) {}

  ngAfterViewInit(): void{
    this.fileTransfer = this.transfer.create();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  getDownloadPath(dir: any): string{
    return (dir + 'Privacy-Statement_tcm145-107975.pdf');
  }

  onDownloadExternal(){
    
    this.fileTransfer
      .download(
        this.url,
        this.getDownloadPath(this.file.externalDataDirectory)
      )
      .then(
        (entry) => {
          this.presentToast('download complete: ' + entry.toURL());
          this.errorString = 'No Errors';
        },
        (error) => {
          // handle error
          this.presentToast(JSON.stringify(error));
          this.errorString = JSON.stringify(error);
        }
      );
  }

  onDownloadData(){

    this.diagnostic.isExternalStorageAuthorized().then((isPermitted: boolean) =>{
      if(isPermitted){
        return this.fileTransfer
        .download(
          this.url,
          this.getDownloadPath(this.file.externalRootDirectory + 'Download/')
        );
      }else{
        return this.askStoragePermissions();
      }
    }).then(
        (entry) => {
          this.presentToast('download complete: ' + entry.toURL());
          this.errorString = 'No Errors';
        },
        (error) => {
          // handle error
          this.presentToast(JSON.stringify(error));
          this.errorString = JSON.stringify(error);
        }
      );
  }

  askStoragePermissions(): Promise<any>{
    this.diagnostic.requestExternalStorageAuthorization().then()
  }

  errorCallback(): void{
    this.presentToast(JSON.stringify(error));
          this.errorString = JSON.stringify(error);
  }

}
