import {
    AuthMethods,
    AuthProvider,
    CredentialHelper,
    AuthProviderWithCustomConfig,
    FirebaseUIAuthConfig
} from 'firebaseui-angular';


const facebookCustomConfig: AuthProviderWithCustomConfig = {
    provider: AuthProvider.Facebook,
    customConfig: {
        scopes: [
            'public_profile',
            'email'
        ],
        customParameters: {
            auth_type: 'reauthenticate'
        }
    }
};

export const firebaseUiAuthConfig: FirebaseUIAuthConfig = {
    providers: [
        AuthProvider.Google,
        facebookCustomConfig,
        AuthProvider.Github
    ],
    method: AuthMethods.Popup,
    tos: 'https://canya.io/assets/docs/Terms-CanYa.pdf',
    credentialHelper: CredentialHelper.OneTap
};

