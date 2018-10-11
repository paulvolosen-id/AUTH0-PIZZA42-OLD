import { Injectable } from '@angular/core';
import { AUTH_CONFIG } from './auth0-variables';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';

(window as any).global = window;

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.clientID,
    domain: AUTH_CONFIG.domain,
    responseType: 'token id_token',
    audience: AUTH_CONFIG.apiUrl,
    redirectUri: AUTH_CONFIG.callbackURL,
    scope: 'openid profile email gender'
  });

  userProfile: any;

  constructor(public router: Router) {}

  public login(): void {
    console.log('isAuth in login: ' + this.isAuthenticated() );
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    console.log ('ENTER: handleAuthentication()');
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        console.log('HANDLEAUTHENTICATION [authResult stringiFied]: ' + JSON.stringify(authResult));
     //  console.log('authResult JSON.PARSE: ' + JSON.parse(authResult));

        this.setSession(authResult);
        this.setEmailVerificationStatus(authResult); // paulvo: setEmailVerificationStatus
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log('error in handleAuthentication: ' + err.error);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
    console.log ('EXIT: handleAuthentication()');
  }

  public getProfile(cb): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }

    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        self.userProfile = profile;
      }
      cb(err, profile);
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('email_verified');

    localStorage.clear(); // ADDED: Paulvo
    // Go back to the home route
    console.log('isAuth in logout: ' + this.isAuthenticated() );

    this.router.navigate(['/home']); // paulvo: added home
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    console.log('ENTER: isAuthenticated() ');
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '{}');
    let isAuth = false;
    isAuth = new Date().getTime() < expiresAt;
    console.log('EXIT: isAuthenticated() --->isAuth: ' + isAuth);
    //alert('isAuth: ' + isAuth);
    return isAuth;
    // return (new Date().getTime() < expiresAt);


  }


  public isEmailVerified() : boolean { // TODO: we should check this on the auth profile
    return localStorage.getItem('emailVerified') == 'true' ? true : false;
  }

   public verifyEmail() : void { // should set email verified on real user profile?
      localStorage.setItem('emailVerified', 'true');
  }

  /*public returnAuthResult(): Object {
    console.log ('ENTER: returnAuthResult()');
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        console.log('authResult: ' + authResult);
        return authResult;
      //  this.setSession(authResult);
    //    this.router.navigate(['/home']);
      } else if (err) {
       // this.router.navigate(['/home']);
        console.log(err.error);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
    console.log ('EXIT: returnAuthResult()');
  } */

  /*public updateUserProfileEmailVerificationStatus2(authResult) : void { // should set email verified on user profile?
    this.auth0.client.userInfo(authResult.accessToken, function(err, user) {
      if (err) {
        console.log('ERROR getting userInfo: ' + err);
        alert('ERROR getting userInfo: ' + err);
       // return false;
      } else {
        console.log ('SUCCESS: get email verification status on userprofile..' + JSON.parse(user.email_verified));
      // localStorage.setItem('emailVerified', user.email_verified);
        user.email_verified = true;
      }
    });
} */

  public setEmailVerificationStatus(authResult) : void  {
    // auth0.client.userInfo(authResult.accessToken, function(err, user) {
      this.auth0.client.userInfo(authResult.accessToken, function(err, user) {
      if (err) {
        console.log('ERROR getting userInfo: ' + err);
        alert('ERROR getting userInfo: ' + err);
       // return false;
      } else {
        console.log ('SUCCESS: get email verification status on userprofile..' + JSON.parse(user.email_verified));
        if (user.email_verified) { // paulvo: added. Check first for it's existence
          localStorage.setItem('emailVerified', user.email_verified);
        } else {
          localStorage.setItem('emailVerified', 'false');
        }
      }
    });
  }
}

