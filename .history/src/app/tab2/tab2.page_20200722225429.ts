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

  /**
   * Retrieves an image from the device based on the sourceType selected from
   * the ActionSheetController of the camera plugin.
   * @param sourceType number indicating photo library or direct camera image
   */
  private takePicture(sourceType: number): void {
    // Create options for the Camera Dialog
    const options: CameraOptions = {
      cameraDirection: this.camera.Direction.FRONT,
      correctOrientation: true,
      quality: 100,
      saveToPhotoAlbum: false,
      sourceType,
    };

    // Get the data of an image
    this.camera
      .getPicture(options)
      .then((imagePath: string): void => {
        // Allow the user to crop the image for circular profile
        this.cropProfileImage(imagePath)
          .then((result: ProfileImageCropResult) => {
            const croppedImageUri: string = result.resultUri;
            const imageType = 'png';

            const onSuccess: (entry: Entry) => void = (entry: Entry): void => {
              this.removeProfileImage();
              this.storageProvider.setValueForKey(
                entry.name,
                StorageType.profileImage
              );
              this.applyDeviceProfileImage(
                window.Ionic.WebView.convertFileSrc(entry.nativeURL)
              );
              this.toastService.displaySuccess(
                Messages.profileImageUpdateSuccess
              );
            };
            const onError: (error: Error) => void = (error: Error): void => {
              this.toastService.displayError(Messages.profileImageStoreError);
            };

            // Set the correct base path
            let srcDir: string;
            if (isAndroid()) {
              srcDir = this.file.cacheDirectory;
            } else {
              // IOS
              srcDir = this.file.tempDirectory;
            }

            // Copy the image to persistent app storage
            this.copyFileToLocalDir({
              destName: this.profileService.createFileName(imageType),
              onError,
              onSuccess,
              srcDir,
              srcName: this.getImageName(croppedImageUri),
            });
          })
          .catch((error: PluginError) => {
            this.toastService.displayError(Messages.profileImageCropError);
          });
      })
      .catch((error: Error) => {
        this.toastService.displayError(Messages.profileImageSelectError);
      });
  }

}
