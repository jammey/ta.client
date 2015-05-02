$(document).on("pageinit", "#pageCompleteProfile", function (event, ui) {
    $("#pageCompleteProfile_txtFirstName").val(localStorage.getItem("c_firstName"));
    $("#pageCompleteProfile_txtLastName").val(localStorage.getItem("c_lastName"));

    if (localStorage.getItem("c_gender"))
    {
        if (localStorage.getItem("c_gender") == "1") {
            $("#pageCompleteProfile_male").removeClass("btnDeactive").addClass("btnActive");
        }else
        {
            $("#pageCompleteProfile_female").removeClass("btnDeactive").addClass("btnActive");
        }
    }

    Ajax.getJson("GetStates", {}, function (data) {
        if (data.IsSuccess) {
            var res = data.Data;
            $("#pageCompleteProfile_selectState").append("<option value=''>" + PageMessage.SelectState + "</option>");
            for (var i = 0; i < res.length; i++) {
                $("#pageCompleteProfile_selectState").append("<option value='" + res[i].Id + "'>" + res[i].StateName + "</option>");
            }

            $("#pageCompleteProfile_selectState").selectmenu("refresh");
        } else {
            Messagebox.popup("Load States error");
        }
    });

    $("#pageCompleteProfile_btnSkip").off("click").on("click", function () {
        $("#pageCompleteProfile_btnNext").trigger("click");
    });

    $("#pageCompleteProfile_male").off("click").on("click", function () {
        if ($(this).hasClass("btnDeactive")) {
            $(this).removeClass("btnDeactive").addClass("btnActive");
            $("#pageCompleteProfile_female").removeClass("btnActive").addClass("btnDeactive");
        }
    });

    $("#pageCompleteProfile_female").off("click").on("click", function () {
        if ($(this).hasClass("btnDeactive")) {
            $(this).removeClass("btnDeactive").addClass("btnActive");
            $("#pageCompleteProfile_male").removeClass("btnActive").addClass("btnDeactive");
        }
    });

    $("#pageCompleteProfile_btnNext").off("click").on("click", function () {
        var pageCompleteProfile_txtFirstName = $("#pageCompleteProfile_txtFirstName").val();
        var pageCompleteProfile_txtLastName = $("#pageCompleteProfile_txtLastName").val();
        var gender = $("#nav_gender a.btnActive").data("gender-value") || 0;
        var pageCompleteProfile_dateBirthday = $("#pageCompleteProfile_dateBirthday").val();
        var pageCompleteProfile_txtPostCode = $("#pageCompleteProfile_txtPostCode").val();
        var pageCompleteProfile_selectState = $("#pageCompleteProfile_selectState").val() || 0;
        var description = $("#pageCompleteProfile_Surburb").val();

        if (!$("#pageCompleteProfile_txtFirstName").emptyValidate(WarningMessage.FirstNameRequired)) {
            return;
        }

        if (!$("#pageCompleteProfile_txtLastName").emptyValidate(WarningMessage.LastNameRequired)) {
            return;
        }

        if (pageCompleteProfile_txtPostCode.length > 4) {
            Messagebox.popup("The postcode must be 4 bits");
            return;
        }

        Ajax.getJson("UpdateCustomerProfile", {
            accountId: getCurrentAccountId(),
            firstName: pageCompleteProfile_txtFirstName,
            lastName: pageCompleteProfile_txtLastName,
            birthday: pageCompleteProfile_dateBirthday,
            gender: gender,
            postCode: pageCompleteProfile_txtPostCode,
            stateId: pageCompleteProfile_selectState,
            description: description
        }, function (data) {
            if (data.IsSuccess) {
                setProfileToLocalStorege(pageCompleteProfile_txtFirstName, pageCompleteProfile_txtLastName, $.jsDate2WcfDate(stringToShortDate(pageCompleteProfile_dateBirthday)),
                        gender, pageCompleteProfile_txtPostCode, pageCompleteProfile_selectState, description);

                if ($("#coverDiv").css("display") == "block") {
                    $("#coverDiv").hide();
                }

                changePage("main.html");
            }
            else {
                Messagebox.popup(data.Message);
            }
        });
    });

});

$(document).on("pageshow", "#pageCompleteProfile", function (event, ui) {
    var isFirstRunReg = localStorage.getItem("c_isFirstRunReg");
    if (!isFirstRunReg || isFirstRunReg == "true") {
        showBubble("Hi mate :)<br>You can do this anytime,<br>from settings.", "gotcha", false, function () {
            localStorage.setItem("c_isFirstRunReg", "false");
        });
    }
});