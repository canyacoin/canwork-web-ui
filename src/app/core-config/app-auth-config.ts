import { firebase, firebaseui } from 'firebaseui-angular';

export const firebaseUiAuthConfig: firebaseui.auth.Config = {
    signInFlow: 'popup',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        {
            scopes: [
                'public_profile',
                'email'
            ],
            customParameters: {
                'auth_type': 'reauthenticate'
            },
            provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID
        }
    ],
    tosUrl: 'https://canya.io/assets/docs/Terms-CanYa.pdf',
    privacyPolicyUrl: '',
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
};
