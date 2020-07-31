import { Component, AfterViewInit } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements AfterViewInit{
  private fileTransfer: FileTransferObject;
  private url = 'https://www.transamerica.com/media/Privacy-Statement_tcm145-107975.pdf';
  constructor(
    private transfer: FileTransfer,
    public file: File) {}

  ngAfterViewInit(): void{
    this.fileTransfer = this.transfer.create();
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
          console.log('download complete: ' + entry.toURL());
        },
        (error) => {
          // handle error
          console.log(error);
        }
      );
  }

  onDownloadData(){
    
    this.fileTransfer
      .download(
        this.url,
        this.getDownloadPath(this.file.externalRootDirectory + 'Downloads')
      )
      .then(
        (entry) => {
          console.log('download complete: ' + entry.toURL());
        },
        (error) => {
          // handle error
          console.log(error);
        }
      );
  }

}
