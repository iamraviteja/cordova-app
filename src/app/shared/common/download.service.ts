import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import {
  FileTransfer,
  FileTransferObject,
} from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';

import { ToastService } from 'shared/services/toast/toast.service';
import { AlertProvider } from 'providers/alert-provider';
import { Messages } from 'shared/services/toast/messages';
import { resolve } from 'dns';
import { reject } from 'lodash';

@Injectable()
export class DownloadService {

  public fileTransfer: FileTransferObject;
  public fileList: string[] = [];
  public fileName: string = 'Privacy-Statement_tcm145-107975';
  public fileExt: string = 'pdf';
  public pdfOptions: any = {
    documentSize: 'A4',
    type: 'base64'
  };

  constructor(
    private alertProvider: AlertProvider,
    private toastService: ToastService,
    private diagnostic: Diagnostic,
    private transfer: FileTransfer,
    public file: File,
    private pdfGenerator: PDFGenerator,
    public platform: Platform
  ) {
    this.fileTransfer = this.transfer.create();
  }

  private getDownloadPath(dir: string, name: string): string {
    return dir + name;
  }

  private checkFileNameInList(list: string[], name: string): string {
    const len = list.filter((item) => item.startsWith(name)).length;
    return len === 0
      ? `${name}.${this.fileExt}`
      : `${name}_${len}.${this.fileExt}`;
  }

  private checkFileNameInDir(
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

  /**
 * Convert a base64 string in a Blob according to the data and contentType.
 *
 * @param b64Data {String} Pure base64 string without contentType
 * @param contentType {String} the content type of the file i.e (application/pdf - text/plain)
 * @param sliceSize {Int} SliceSize to process the byteCharacters
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @return Blob
 */
private b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        const byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

      let blob = new Blob(byteArrays, {type: contentType});
      return blob;
}

/**
 * Create a PDF file according to its database64 content only.
 *
 * @param folderpath {String} The folder where the file will be created
 * @param filename {String} The name of the file that will be created
 * @param content {Base64 String} Important : The content can't contain the following string (data:application/pdf;base64). Only the base64 string is expected.
 */
private savebase64AsPDF(folderpath, filename, content, contentType, resolve, reject){
    // Convert the base64 string in a Blob
    const DataBlob = this.b64toBlob(content, contentType, 512);
    const writeSuccess = {
      isComplete: true,
      message: `Completed writing`
    };
    const writeError = {
      isComplete: false,
      message: `Failed Completed writing`
    };

    console.log("Starting to write the file :3");

    this.file.resolveLocalFilesystemUrl(folderpath).then(
    (entry) => {
      entry.getParent((dir)=>{
        console.log("Access to the directory granted succesfully");
        dir.getFile(filename, {create:true}, (file) =>{
          console.log("File created succesfully.");
          file.createWriter(
            (fileWriter) =>{
            console.log("Writing content to file");
            fileWriter.onwriteend = () => { resolve(writeSuccess); };
            fileWriter.onerror = () => { reject(writeError); };
            fileWriter.write(DataBlob);
          },
          () => {
            writeError.message = 'Unable to save file in path '+ folderpath;
            reject(writeError);
          });
        });
      });
    }, () => { reject(writeError); });
}

  private downloadContent(
    content:any,
    filename:string
  ): Promise<any> {
    const options = {
      documentSize: 'A4',
      type: 'base64'
    };
    const pdfhtml = `<html><body>${content}</body></html>`;
    return this.pdfGenerator.fromData(pdfhtml , options);
  }

  private askStoragePermissions(): Promise<any> {
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

  public async onDownloadClicked(title:string, content:string): Promise<any> {
    let isAuthorized;
    let permissionStatus;
    const writeError = {
      isComplete: false,
      message: `Failed Completed writing`
    };

    // replace spaces with underscore
    title = title.replace(/ /g, '_');

    // check if app has permissions to read and write to external storage
    // try catch block to check on the cordova errors
    try {
      isAuthorized = await this.diagnostic.isCameraAuthorized();

      console.log(`isAuthorized completed`);

      if (isAuthorized) {
        // check if the file exits in directory if present, add number to file name
        const fileName = await this.checkFileNameInDir(
          this.file.externalRootDirectory,
          'download',
          title
        );

        // download the content to downloads directory
        const base64 = await this.downloadContent(
          content,
          fileName
        );
        const contentType = 'application/pdf';
        const folderpath = this.file.externalRootDirectory + 'download/';
        console.log(`fileName completed`,folderpath, fileName);
        return new Promise((resolve, reject)=>{
          this.savebase64AsPDF(folderpath, fileName, base64, contentType, resolve, reject);
        });

      } else {
        // if app does not have permissions the ask for read and write permissions
        permissionStatus = await this.askStoragePermissions();
        console.log(`permissionStatus completed`);
        if (
          permissionStatus.WRITE_EXTERNAL_STORAGE ===
          this.diagnostic.permissionStatus.GRANTED
        ) {
          // if the write permission is given then proceed to download
          // check if the file exits in directory if present, add number to file name
          const fileName = await this.checkFileNameInDir(
            this.file.externalRootDirectory,
            'download',
            title
          );

          // download the file to downloads directory
          const base64 = await this.downloadContent(
            content,
            fileName
          );
          const contentType = 'application/pdf';
          const folderpath = this.file.externalRootDirectory + 'download/';
          console.log(`permissionStatus completed :: fileName completed`,folderpath, fileName);
          return new Promise((resolve, reject)=>{
            this.savebase64AsPDF(folderpath, fileName, base64, contentType, resolve, reject);
          });

        } else {
          throw Error(
            `Permission not granted :: ${JSON.stringify(permissionStatus)}`
          );
        }
      }
    } catch (error) {
      this.alertProvider.alertError(error, 'Error:');
      writeError.message = error.message;
      return Promise.reject(writeError);
    }

  }
}
