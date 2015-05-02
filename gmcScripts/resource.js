var WarningMessage = {
    FirstNameRequired: "Please let us know your first name",
    LastNameRequired: "Please let us know your last name",
    MobileRequired: "Please enter your mobile",
    VerificationCodeRequired: "Please enter your verification code",
    InvalidMobile:"The mobile must be 9 or 10 bits",
    PhoneNumberNotExisting: "The mobile not existing",
    InvalidVerificationCode: "Please enter a valid verification code",
    CodeExpired: "Your valid verification is expired",
    PasswordRequired: "Please enter the password",
    NewPasswordRequired: "Please enter the new password",
    InvalidPassword: "The password must be 6 to 32 bits",
    AlreadyBindingMobile: "There is a mobile associate with you. Sorry, you can't change it",
    MobileIsExisted: "Please enter another mobile, since the mobile has been binding to the other user"
};

var SuccessfulMessage = {
    ResetPassword: "Your password has been reset successfully",
    GetCode: "Your will receive a SMS in shortly",
    BindMobile: "Your mobile has been bind to your account. You can login with it next time."
}

var PageMessage = {
    DefaultCustomerName: "Customer",
    DefaultTradieName: "Tradie",
    SelectState: "Select the State"
};

var Config = {
    rootPath: "http://192.168.5.111:8888/Api.svc/",
    chatHubRootPath: "http://192.168.5.111:8088/",
    thirdparty_redirect_uri: "http://localhost:47661/Social.html",
    thirdparty_oauth_proxy: "https://auth-server.herokuapp.com/proxy",
    google_client_id: "656984324806-sr0q9vq78tlna4hvhlmcgp2bs2ut8uj8.apps.googleusercontent.com",
    facebook_client_id: "1525868700998425",
    twitter_client_id: { 'adodson.com': 'duwANhAZe5CmQnlGEiOFTDBr0' }[window.location.hostname],
    appVersion: "1.0.0",
    getCurrentPositionOption: { timeout: 3000, enableHighAccuracy: true },
    googleMapZoom: 16,
    //refreshGoogleMapTime: 60 * 60 * 1000,
    refreshGoogleMapTime: 10 * 1000,
    refreshUnreadMessage: 10 * 1000
};
