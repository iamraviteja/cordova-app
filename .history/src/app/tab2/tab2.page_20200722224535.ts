import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

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

  constructor() {}

}
