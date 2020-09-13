import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

declare const FingerprintAuth: any;

interface TouchAuthResult{
    token?:any,
    error?:any,
    isAuthWithBackup?:boolean,
    isAuthenticated:boolean
}

@Injectable()
export class TouchAuth {

    private isTouchAvalible:boolean = false;
    private isFingerprintAuthAvailable:boolean = false;
    private isTouchidAvailable:boolean = false;

    private fingerprintResult:any = {isAvailable: false};
    private fingerprintResultMsg:string = "no message";

    private encryptConfig:any = {
        clientId:'key0',
        username:'ravid',
        password:'dont4get',
        maxAttempts:3,
        dialogTitle:'Authentication',
        dialogMessage:'Use your fingerprint to authenticate',
        dialogHint:'update dialog hint!!'
    }

    private touchAuthSubject:BehaviorSubject<TouchAuthResult> = new BehaviorSubject<TouchAuthResult>({ isAuthenticated:false });

    constructor() {
        
    }

    private setAndroid() {
        this.isTouchAvalible = true;
        this.isFingerprintAuthAvailable = true;
        this.isTouchidAvailable = false;
    }

    private setIos() {
        this.isTouchAvalible = true;
        this.isFingerprintAuthAvailable = false;
        this.isTouchidAvailable = true;
    }

    /**
     * getTouchAvaliability
     */
    public getTouchAvaliability() {
        return {
            isTouchAvalible: this.isTouchAvalible,
            isFingerprintAuthAvailable : this.isFingerprintAuthAvailable,
            isTouchidAvailable : this.isTouchidAvailable
        }
    }

    /**
     * getFingerPrintResults
     */
    public getFingerPrintResults() {
        return {
            fingerprintResult: this.fingerprintResult,
            fingerprintResultMsg: this.fingerprintResultMsg
        }
    }

    /**
     * getTouchAuthResults
     */
    public getTouchAuthResults() {
        return this.touchAuthSubject.asObservable();
    }

    private checkFingerprintAvailability() {
        FingerprintAuth.isAvailable((result) =>{
            this.fingerprintResultMsg = 'sucesss';
            console.log("FingerprintAuth available: " + JSON.stringify(result));
            this.fingerprintResult = {result, isAvailable: true};
            this.fingerprintResultMsg = JSON.stringify(result, ['isAvailable', 'isHardwareDetected', 'hasEnrolledFingerprints'], 4);
            if (result.isAvailable) {
                this.setAndroid();
            }
        },
        (message)=>{
            this.fingerprintResultMsg = 'error';
            console.log("isAvailableError(): " + message);
            this.fingerprintResult = {isAvailable: false};
            this.fingerprintResultMsg = JSON.stringify(message);
        });
    }

    private checkTouchidAvailability() {
        // check the touch id availability here
        this.setIos();
    }

    checkTouchAuthAvailability(isCordova:Boolean, isAndroid:Boolean, isIos:Boolean){
        this.fingerprintResultMsg = `isCordova ${isCordova} && isAndroid ${isAndroid} && isIos ${isIos}`;
        if(isCordova && isAndroid){
            this.fingerprintResultMsg = 'android fingerprint check started';
            this.checkFingerprintAvailability();
        }
        if(isCordova && isIos){
            this.fingerprintResultMsg = 'Ios touchid check started';
            this.checkTouchidAvailability();
        }
    }

    private fingerprintAuthentication(){
        FingerprintAuth.encrypt(
            this.encryptConfig,
            (result) =>{
                if(result.withFingerprint) this.touchAuthSubject.next({ isAuthenticated: true, isAuthWithBackup: false, token: result.token, error: null});
                if(result.withBackup) this.touchAuthSubject.next({ isAuthenticated: false, isAuthWithBackup: true, error: 'authenticated with backup'});
            },
            (error) =>{
                if (error === FingerprintAuth.ERRORS.FINGERPRINT_CANCELLED) {
                    this.touchAuthSubject.next({ isAuthenticated: false, isAuthWithBackup: false, error: 'FingerprintAuth Dialog Cancelled!' });
                } else {
                    this.touchAuthSubject.next({ isAuthenticated: false, isAuthWithBackup: false, error });
                }
            }
        );
    }

    authenticateTouch(){
        if(this.isTouchAvalible && this.isFingerprintAuthAvailable){
            this.fingerprintAuthentication();
        }
    }



}