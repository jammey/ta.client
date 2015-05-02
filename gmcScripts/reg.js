$(document).on("pageshow", "#pageReg", function (event, ui) {
    function GetRegCode(txtCode, txtMobile) {
        Ajax.getJson("GetVerificationCode", { "phoneNumber": txtMobile.val() }, function (data) {
            if (data.IsSuccess) {
                var time = 60;
                $(txtCode).text("60 secs").addClass("ui-state-disabled");
                var _interval = window.setInterval(function () {
                    if (time > 0) {
                        time--;
                        $(txtCode).text(time + " secs");
                    } else {
                        window.clearInterval(_interval)
                        _interval = null;
                        time = 60;
                        $(txtCode).text("Get Code").removeClass("ui-state-disabled");
                    }
                }, 1000);
            } else {
                Messagebox.popup(data.message);
            }
        });
    }

    $("#pageReg_btnGetRegCode").off("click").on("click", function () {

        var pageReg_txtRegMobile = $("#pageReg_txtRegMobile");

        if (!$("#pageReg_txtRegMobile").emptyValidate(WarningMessage.MobileRequired)) {
            return;
        }

        if (!$("#pageReg_txtRegMobile").mobileValidate(WarningMessage.InvalidMobile)) {
            return;
        }

        GetRegCode($("#pageReg_btnGetRegCode"), pageReg_txtRegMobile)
    });

    $("#pageReg_btnReg").off("click").on("click", function () {
        var pageReg_txtRegMobile = $.trim($("#pageReg_txtRegMobile").val());
        var pageReg_txtRegPassword = $.trim($("#pageReg_txtRegPassword").val());
        var pageReg_txtRegCode = $.trim($("#pageReg_txtRegCode").val());

        if (!$("#pageReg_txtRegMobile").emptyValidate(WarningMessage.MobileRequired)) {
            return;
        }

        if (!$("#pageReg_txtRegMobile").mobileValidate(WarningMessage.InvalidMobile)) {
            return;
        }

        if (!$("#pageReg_txtRegPassword").emptyValidate(WarningMessage.PasswordRequired)) {
            return;
        }
        if (!$("#pageReg_txtRegPassword").passwordValidate(WarningMessage.InvalidPassword)) {
            return;
        }

        if (!$("#pageReg_txtRegCode").emptyValidate(WarningMessage.VerificationCodeRequired)) {
            return;
        }

        if (!$("#pageReg_txtRegPassword").passwordValidate(WarningMessage.InvalidPassword)) {
            return;
        }

        Ajax.getJson("MobileRegister", { phoneNumber: pageReg_txtRegMobile, password: pageReg_txtRegPassword, verificationCode: pageReg_txtRegCode, accountType: 0 }, function (data) {
            if (data.IsSuccess) {
                Login(pageReg_txtRegMobile, pageReg_txtRegPassword, function () {
                    if (window.deviceReady) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            Ajax.postJson("UpdateCoordinate", {
                                accountId: getCurrentAccountId(),
                                accountType: 0,
                                location: {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude
                                }
                            }, function (data) {
                            });
                        }, onGeolocationError, Config.getCurrentPositionOption);
                    }

                    localStorage.setItem("c_isFirstRunReg", "true");
                    changePage("completeprofile.html");
                });
            } else {
                Messagebox.popup(data.Message);
            }
        });

    });
});
