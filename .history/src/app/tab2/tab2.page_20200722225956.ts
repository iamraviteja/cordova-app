import { Component, NgZone } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActionSheetController, ToastController, Platform } from '@ionic/angular';

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
let platform: Platform;

const setPlatform = (value: Platform): void => {
  platform = value;
};

export const isIos = (): boolean => platform && platform.is('ios');
export const isAndroid = (): boolean => platform && platform.is('android');

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
    private platform: Platform,
    public toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private camera: Camera,
    private diagnostic: Diagnostic,
    private domSanitizer: DomSanitizer,
    private file: File,
    private zone: NgZone
  ) {
    setPlatform(this.platform);
  }

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
   * Forces a check on the camera permissions as a workaround to an IOS
   * issue in which the screen going black after permissions are first
   * requested.
   */
  private checkCameraPermissions(): Promise<void> {
    let cameraPromise: Promise<void>;
    if (isIos()) {
      cameraPromise = new Promise<void>((resolve: any, reject: any): void => {
        this.diagnostic
          .isCameraAuthorized()
          .then((auth: boolean) => {
            if (!auth) {
              this.diagnostic
                .requestCameraAuthorization()
                .then((status: string) => {
                  if (status === this.diagnostic.permissionStatus.GRANTED) {
                    resolve();
                  } else {
                    reject();
                  }
                })
                .catch(() => {
                  reject();
                });
            } else {
              resolve();
            }
          })
          .catch((error: Error): void => {
            reject();
          });
      });
    } else {
      cameraPromise = Promise.resolve();
    }
    return cameraPromise;
  }

  /**
   * Copies a retrieved image to peristent app storage.
   * @param options object which contains parameters needed for a file plugin copy
   */
  private copyFileToLocalDir(options: LocalFileCopy): void {
    this.file
      .copyDir(
        this.file.dataDirectory,
        options.srcDir,
        options.srcName,
        options.destName
      )
      .then(
        (entry: Entry) => {
          options.onSuccess(entry);
        },
        (error: Error) => {
          options.onError(error);
          this.presentToast('Messages.profileImageStoreError');
        }
      );
  }

   /**
   * Calls the plugin which launches image cropping.
   * @param imageUri the uri of the retrieved image
   */
  private cropProfileImage(imageUri: string): Promise<ProfileImageCropResult> {
    return ProfileImageCrop.crop({
      imageUri,
    });
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

              this.applyDeviceProfileImage(
                window.Ionic.WebView.convertFileSrc(entry.nativeURL)
              );
              this.presentToast(
                'Messages.profileImageUpdateSuccess'
              );
            };
            const onError: (error: Error) => void = (error: Error): void => {
              this.presentToast('Messages.profileImageStoreError');
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
