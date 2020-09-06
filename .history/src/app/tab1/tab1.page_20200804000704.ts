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
  private downloadLink =
    "https://www.transamerica.com/media/Privacy-Statement_tcm145-107975.pdf";
  public fileName: string = 'Privacy-Statement_tcm145-107975';
  public fileExt: string = 'pdf';

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
        this.downloadLink,
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

  errorCallback(error: any): void {
    this.presentToast(JSON.stringify(error));
    this.logs.push(JSON.stringify(error));
  }

  getDownloadPath(dir: string, name: string): string {
    return dir + name;
  }

  checkFileNameInList(list: string[], name: string): string {
    const len = list.filter((item) => item.startsWith(name)).length;
    return len === 0
      ? `${name}.${this.fileExt}`
      : `${name}_${len}.${this.fileExt}`;
  }

  checkFileNameInDir(
    filePath: string,
    dirName: string,
    fileName: string
  ): Promise<any> {
    return this.file.listDir(filePath, dirName).then(
      (entry) => {
        this.fileList = entry
          .filter((item) => item.isFile)
          .map((item) => item.name);
        return this.checkFileNameInList(this.fileList, fileName);
      },
      (error) => {
        // handle error
      }
    );
  }

  downloadToRootDir(
    downloadLink: string,
    filePath: string,
    fileName: string
  ): Promise<any> {
    return this.fileTransfer.download(
      downloadLink,
      this.getDownloadPath(filePath, fileName),
      true,
      {}
    );
  }

  askStoragePermissions(): Promise<any> {
    return this.diagnostic
      .requestRuntimePermissions([
        this.diagnostic.permission.READ_EXTERNAL_STORAGE,
        this.diagnostic.permission.WRITE_EXTERNAL_STORAGE,
      ])
      .then(
        (status: any) => {
          return status;
        },
        (err) => {}
      );
  }

  showMessage(key:string, msg:string){
    const message = `${key} :: ${msg}`;
    this.presentToast(message);
    this.logs.push(message);
  }

  /**
   * onDownloadClicked
   */
  public async onDownloadClicked(){
    let isAuthorized;
    let permissionStatus;
    let isDownloadComplete;

    try {
      isAuthorized = await this.diagnostic.isExternalStorageAuthorized();

      this.showMessage('isAuthorized', isAuthorized);

      if (isAuthorized) {
        const fileName = await this.checkFileNameInDir(
          this.file.externalRootDirectory,
          'download',
          this.fileName
        );

        this.showMessage('filename', fileName);

        isDownloadComplete = await this.downloadToRootDir(
          this.downloadLink,
          this.file.externalRootDirectory + 'download/',
          fileName
        );

        this.showMessage('isDownloadComplete', JSON.stringify(isDownloadComplete));
      } else {
        permissionStatus = await this.askStoragePermissions();
        this.showMessage('permissionStatus', JSON.stringify(permissionStatus));
        if (
          permissionStatus.WRITE_EXTERNAL_STORAGE ===
          this.diagnostic.permissionStatus.GRANTED
        ) {
          const fileName = await this.checkFileNameInDir(
            this.file.externalRootDirectory,
            'download',
            this.fileName
          );

          this.showMessage('filename', fileName);

          isDownloadComplete = await this.downloadToRootDir(
            this.downloadLink,
            this.file.externalRootDirectory + 'download/',
            fileName
          );

          this.showMessage('isDownloadComplete', JSON.stringify(isDownloadComplete));
        } else {
          throw Error(`Permission not granted :: ${JSON.stringify(permissionStatus)}`);
        }
      }
    } catch (error) {
      this.showMessage('isDownloadComplete', JSON.stringify(error));
    }
  }

  onSendEmail() {
    this.fileTransfer
      .download(this.downloadLink, this.getDownloadPath(this.file.externalDataDirectory, this.fileName))
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
