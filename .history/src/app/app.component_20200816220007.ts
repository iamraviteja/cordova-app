import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { TouchAuth } from './shared/touch-auth/touch-auth';

const isBrowser: Function = (platform: Platform): boolean =>  platform && (platform.is('desktop') || platform.is('mobileweb'));
const isCordova: Function = (platform: Platform): boolean => platform && platform.is('cordova');
const isIos: Function = (platform: Platform): boolean => platform && platform.is('ios');
const isAndroid: Function = (platform: Platform): boolean => platform && platform.is('android');

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private touchAuth:TouchAuth
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.styleLightContent();      
      this.splashScreen.hide();
      this.touchAuth.checkTouchAuthAvailability(isCordova(this.platform), isAndroid(this.platform), isIos(this.platform));    
    });
  }
}
