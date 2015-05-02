$(document).on("pageshow", "#pageBindMobile", function (event, ui) {
    var selfPage = $(this);

    selfPage.on("click", "#pageBindMobile_btnBindMobile", function () {
        if (!$("#pageBindMobile_txtMobile").emptyValidate(WarningMessage.MobileRequired)) {
            return;
        }

        if (!$("#pageBindMobile_txtMobile").mobileValidate(WarningMessage.InvalidMobile)) {
            return;
        }

        if (!$("#pageBindMobile_txtPassword").emptyValidate(WarningMessage.PasswordRequired)) {
            return;
        }

        if (!$("#pageBindMobile_txtPassword").passwordValidate(WarningMessage.InvalidPassword)) {
            return;
        }

        Ajax.getJson("SocialBindMobile", {
            accountId: getCurrentAccountId(),
            mobile: $.trim($("#pageBindMobile_txtMobile").val()),
            password: $.trim($("#pageBindMobile_txtPassword").val()),
            accountType: 0
        },
        function (data) {
            if (!data.IsSuccess) {
                Messagebox.popup(data.Message);
                return;
            } else {
                if (data.Data.Status == socialBindMobileResponseStatus.alreadyBindingMobile) {
                    Messagebox.popup(WarningMessage.AlreadyBindingMobile);
                } else if (data.Data.Status == socialBindMobileResponseStatus.mobileIsExisted) {
                    Messagebox.popup(WarningMessage.MobileIsExisted);
                } else {
                    Messagebox.popup(SuccessfulMessage.BindMobile);
                    changePage("completeprofile.html");
                }
            }
        });
    });

    selfPage.on("click", "#pageBindMobile_btnSkip", function () {
        changePage("completeprofile.html");
    });
});
