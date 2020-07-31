import { Component, NgZone } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActionSheetController, ToastController } from '@ionic/angular';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Entry, File } from '@ionic-native/file/ngx';

enum ProfileDisplayType {
  DEFAULT,
  IMAGE,
  INITIALS
}

interface LocalFileCopy {
  destName: string;
  srcDir: string;
  srcName: string;
  onError(error: Error): void;
  onSuccess(entry: Entry): void;
}

interface PluginError {
  name: string;
  code: string;
}

interface ProfileImageCropResult {
  resultUri: string;
}

declare const ProfileImageCrop: any;
declare const window: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public initials = 'TA';
  public fullname = 'TEST USER';
  public profileImageUri: SafeUrl;
  public profileDisplayType: ProfileDisplayType = ProfileDisplayType.DEFAULT;
  public profileDisplayTypeEnumRef: object = ProfileDisplayType;

  constructor(
    public toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private diagnostic: Diagnostic,
    private domSanitizer: DomSanitizer,
    private file: File,
    private zone: NgZone
  ) {}

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  public async onAddPhoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons: [
        {
          handler: (): void => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          },
          text: 'Photo Library',
        },
        {
          handler: (): void => {
            this.checkCameraPermissions().then(
              () => {
                this.takePicture(this.camera.PictureSourceType.CAMERA);
              },
              (error: Error) => {
                this.presentToast(
                  'Messages.profileImageCameraError'
                );
              }
            );
          },
          text: 'Take a Photo',
        },
        {
          role: 'cancel',
          text: 'Cancel',
        },
      ],
    });

    await actionSheet.present();
  }

}
