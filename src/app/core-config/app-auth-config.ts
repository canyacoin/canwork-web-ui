import { firebase, firebaseui } from 'firebaseui-angular'

export const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    {
      scopes: ['public_profile', 'email'],
      customParameters: {
        auth_type: 'reauthenticate',
      },
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    },
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  ],
  tosUrl: 'https://canwork.io/assets/docs/canwork-terms-and-conditions.pdf',
  privacyPolicyUrl:
    'https://canwork.io/assets/docs/canwork-privacy-policy.pdf',
  // dataDeletionUrl: 'https://www.canwork.io/assets/docs/Data-Deletion-Request-Instructions.pdf',
  credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
}
