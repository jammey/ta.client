$(document).on("pageinit", "#pageForgetPassword", function (event, ui) {
    var selfPage = $(this);

    selfPage.on("click", "#pageForgetPassword_btnNext", function () {
        var pageForgetPassword_txtMobile = $("#pageForgetPassword_txtMobile");
        if (!pageForgetPassword_txtMobile.emptyValidate(WarningMessage.MobileRequired)) {
            return;
        }

        if (!pageForgetPassword_txtMobile.mobileValidate(WarningMessage.InvalidMobile)) {
            return;
        }

        var pageForgetPassword_txtCode = $("#pageForgetPassword_txtCode");
        if (!pageForgetPassword_txtCode.emptyValidate(WarningMessage.VerificationCodeRequired)) {
            return;
        }

        Ajax.getJson("VerifyCodeForResetPassword", { code: $.trim(pageForgetPassword_txtCode.val()), phoneNumber: $.trim(pageForgetPassword_txtMobile.val()) },
            function (data) {
                if (!data.IsSuccess) {
                    Messagebox.popup(data.Message);
                    return;
                } else {
                    var status = data.Data.Status;
                    if (status == verifyCodeForResetPasswordStatus.invalidCode) {
                        Messagebox.popup(WarningMessage.InvalidVerificationCode);
                    } else if (status == verifyCodeForResetPasswordStatus.invalidCode) {
                        Messagebox.popup(WarningMessage.InvalidVerificationCode);
                    } else if (status == verifyCodeForResetPasswordStatus.phoneNumberNotExisting) {
                        Messagebox.popup(WarningMessage.PhoneNumberNotExisting);
                    } else {
                        $("#pageForgetPassword_basicInfo").hide();
                        $("#pageForgetPassword_passwordInfo").show();
                    }
                }
            });
    });

    selfPage.on("click", "#pageForgetPassword_btnGetCode", function () {
        var pageForgetPassword_txtMobile = $("#pageForgetPassword_txtMobile");
        if (!pageForgetPassword_txtMobile.emptyValidate(WarningMessage.MobileRequired)) {
            return;
        }

        if (!pageForgetPassword_txtMobile.mobileValidate(WarningMessage.InvalidMobile)) {
            return;
        }

        Ajax.getJson("GetVerificationCodeForResetPassword", { phoneNumber: $.trim(pageForgetPassword_txtMobile.val()), accountType: 0 },
            function (data) {
                if (!data.IsSuccess) {
                    Messagebox.popup(data.Message);
                    return;
                } else {
                    if (!data.Data) {
                        Messagebox.popup(WarningMessage.PhoneNumberNotExisting);
                    } else {
                        Messagebox.popup(SuccessfulMessage.GetCode);
                    }
                }
            });
    });

    selfPage.on("click", "#pageForgetPassword_btnBack", function () {
        $("#pageForgetPassword_basicInfo").show();
        $("#pageForgetPassword_passwordInfo").hide();
    });

    selfPage.on("click", "#pageForgetPassword_btnReset", function () {
        if (!$("#pageForgetPassword_txtPassword").emptyValidate(WarningMessage.NewPasswordRequired)) {
            return;
        }

        if (!$("#pageForgetPassword_txtPassword").passwordValidate(WarningMessage.InvalidPassword)) {
            return;
        }

        Ajax.getJson("ResetPassword", { phoneNumber: $.trim($("#pageForgetPassword_txtMobile").val()), password: password, accountType: 0 },
            function (data) {
                if (!data.IsSuccess) {
                    Messagebox.popup(data.Message);
                    return;
                } else {
                    if (!data.Data) {
                        Messagebox.popup(WarningMessage.PhoneNumberNotExisting);
                    } else {
                        Messagebox.popup(SuccessfulMessage.ResetPassword);
                        changePage("index.html");
                    }
                }
            });
    });
});