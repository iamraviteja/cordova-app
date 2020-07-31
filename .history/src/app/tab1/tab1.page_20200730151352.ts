import { Component, AfterViewInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';


@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page implements AfterViewInit {
  public logs: string[] = [];
  public errorString: string = "No Errors";
  private fileTransfer: FileTransferObject;
  private fileList: string[] = [];
  private url =
    "https://www.transamerica.com/media/Privacy-Statement_tcm145-107975.pdf";
  constructor(
    public toastController: ToastController,
    private diagnostic: Diagnostic,
    private emailComposer: EmailComposer,
    private transfer: FileTransfer,
    public file: File
  ) {}

  ngAfterViewInit(): void {
    this.fileTransfer = this.transfer.create();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
    });
    toast.present();
  }

  getDownloadPath(dir: any): string {
    return dir + "Privacy-Statement_tcm145-107975.pdf";
  }

  onListDir(): void {
    this.file.listDir(this.file.externalRootDirectory, "download").then(
      (entry) => {
        this.fileList = entry.filter(item => item.isFile).map(item => item.name);
        this.presentToast(JSON.stringify(this.fileList));
        this.logs.push(JSON.stringify(this.fileList));        
      },
      (error) => {
        // handle error
        this.presentToast(JSON.stringify(error));
        this.logs.push(JSON.stringify(error));
      }
    );
  }

  checkFileNo(name: string): string{

    const len = this.fileList.filter(item => item.startsWith(name)).length;

    if (len === 0){
      return name;
    }else{
      return `${name}_${len}`;
    }
  }

  checkFileExists(path: string, file: string): Promise<boolean> {
    return this.file.checkFile(path, file);
  }

  onCopyFileData(): void {
    let fileName = this.checkFileNo('Privacy-Statement_tcm145-107975');
    fileName += '.pdf';
    this.fileTransfer
      .download(
        this.url,
        (this.file.cacheDirectory + fileName))
      .then(
        (entry) => {
          this.presentToast("copy download complete: " + entry.toURL());
          this.logs.push("copy download complete: " + entry.toURL());
          return this.file.copyFile(
            this.file.cacheDirectory,
            fileName,
            this.file.externalRootDirectory + "download/",
            fileName
          );
        },
        (error) => {
          // handle error
          this.presentToast(JSON.stringify(error));
          this.logs.push(JSON.stringify(error));
        }
      )
      .then(
        (entry) => {
          this.presentToast("copy complete" + JSON.stringify(entry));
          this.logs.push("copy complete" + JSON.stringify(entry));
        },
        (error) => {
          // handle error
          this.presentToast(JSON.stringify(error));
          this.logs.push(JSON.stringify(error));
        }
      );
  }

  onDownloadExternal() {
    this.fileTransfer
      .download(this.url, this.getDownloadPath(this.file.externalDataDirectory))
      .then(
        (entry) => {
          this.presentToast("download complete: " + entry.toURL());
          this.logs.push("download complete: " + entry.toURL());
        },
        (error) => {
          // handle error
          this.presentToast(JSON.stringify(error));
          this.logs.push(JSON.stringify(error));
        }
      );
  }

  downloadToRootDir(): Promise<any> {
    return this.fileTransfer.download(
      this.url,
      this.getDownloadPath(this.file.externalRootDirectory + "download/"),
      true,
      {}
    );
  }

  onDownloadData() {
    this.diagnostic
      .isExternalStorageAuthorized()
      .then((isPermitted: boolean) => {
        if (isPermitted) {
          return this.downloadToRootDir();
        } else {
          return this.askStoragePermissions();
        }
      })
      .then((entry) => {
        this.presentToast("download complete: " + entry.toURL());
        this.logs.push("download complete: " + entry.toURL());
      }, this.errorCallback.bind(this))
      .catch(this.errorCallback.bind(this));
  }

  askStoragePermissions(): Promise<any> {
    return this.diagnostic
      .requestRuntimePermissions([
        this.diagnostic.permission.READ_EXTERNAL_STORAGE,
        this.diagnostic.permission.WRITE_EXTERNAL_STORAGE,
      ])
      .then((status: any) => {
        this.logs.push(
          `status :: ${JSON.stringify(status)} :: ${
            this.diagnostic.permissionStatus.GRANTED
          }`
        );
        if (
          status.WRITE_EXTERNAL_STORAGE ===
          this.diagnostic.permissionStatus.GRANTED
        ) {
          return this.downloadToRootDir();
        } else {
          this.logs.push(
            `No Download :: ${JSON.stringify(status)} :: ${
              this.diagnostic.permissionStatus.GRANTED
            }`
          );
          // throw Error(`Permission not granted :: ${status}`);
        }
      }, this.errorCallback.bind(this));
  }

  errorCallback(error: any): void {
    this.presentToast(JSON.stringify(error));
    this.logs.push(JSON.stringify(error));
  }

  /**
   * onDownloadClicked
   */
  public async onDownloadClicked(){
    let isAuthorized;
    let permissionStatus;
    let isDownloadComplete;

    isAuthorized = await this.diagnostic.isExternalStorageAuthorized();

    if (isAuthorized) {
      const fileName = await this.checkFileNameInDir(
        this.file.externalRootDirectory,
        'download',
        this.fileName
      );
      isDownloadComplete = await this.downloadToRootDir(
        this.downloadLink,
        this.file.externalRootDirectory + 'download/',
        fileName
      );
    } else {
      permissionStatus = await this.askStoragePermissions();
      if (
        permissionStatus.WRITE_EXTERNAL_STORAGE ===
        this.diagnostic.permissionStatus.GRANTED
      ) {
        const fileName = await this.checkFileNameInDir(
          this.file.externalRootDirectory,
          'download',
          this.fileName
        );
        isDownloadComplete = await this.downloadToRootDir(
          this.downloadLink,
          this.file.externalRootDirectory + 'download/',
          fileName
        );
      } else {
        throw Error(`Permission not granted :: ${JSON.stringify(status)}`);
      }
    }
  }

  onSendEmail() {
    this.fileTransfer
      .download(this.url, this.getDownloadPath(this.file.externalDataDirectory))
      .then(
        (entry) => {
          this.presentToast("download complete for email: " + entry.toURL());
          this.logs.push("download complete for email: " + entry.toURL());
          let email = {
            attachments: [entry.toURL()],
            subject: "Cordova Icons",
            body: "How are you? Nice greetings from Leipzig",
            isHtml: true,
          };
          this.emailComposer.open(email);
        },
        (error) => {
          // handle error
          this.presentToast(JSON.stringify(error));
          this.logs.push(JSON.stringify(error));
        }
      );
  }
}
