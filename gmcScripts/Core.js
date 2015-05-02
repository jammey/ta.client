var pageNumber = 10;
var messageTypeEnum = { Text: 0, Video: 1, Photo: 2 };
var settingStatus = { On: "on", Off: "off" };
var verifyCodeForResetPasswordStatus = { invalidCode: 0, codeExpired: 1, phoneNumberNotExisting: 2, success: 3 };
var socialBindMobileResponseStatus = { alreadyBindingMobile: 0, mobileIsExisted: 1, success: 2 };
var userProfileType = { normal: 0, social: 1 };
var noMessageItemHtml = "<div class=\"noItemClass\">You haven't any messages yet.</div>";

$(function () {
    $.mobile.page.prototype.options.domCache = false;
});

function Login(mobile, password, callBack) {
    
    Ajax.getJson("MobileLogin", { "phoneNumber": mobile, "password": password, "accountType": 0 }, function (data) {
        if (data.IsSuccess) {

            localStorage.setItem("c_account", data.Data.PhoneNumber);
            localStorage.setItem("c_accountId", data.Data.Id);
            localStorage.setItem("c_avatar", data.Data.Thumbnail);
            localStorage.setItem("c_isPaid", data.Data.IsPaid);

            var customer = data.Data.Customer;
            setProfileToLocalStorege(data.Data.FirstName, data.Data.LastName, customer.Birthday, customer.Gender, customer.PostCode,
                data.Data.State ? data.Data.State.Id : "", data.Data.Description);

            if ($.isFunction(callBack)) {
                callBack();
            }
        } else {
            Messagebox.popup(data.Message);
        }
    });
}

$(document).on("pageinit", "[data-role='page']", function () {
    $("#pageLoadingCount").val("0");
});

function checkLogin() {
    if (window.localStorage.getItem("c_account") == null || window.localStorage.getItem("c_accountId") == "") {
        return false;
    }

    return true;
}

function callServiceCallBack(buttonIndex) {
    if (buttonIndex == 2) {
        window.open('tel:4006997118', '_system');
    }
}

function closePopup(obj, id) {
    $(obj).parents("[data-role='page']").find("#" + id).popup("close");
}

function showBubbleOnTA() {
    showBubble('<br>Please choose a service category.', "next", true, function () {
        $("#divCategoryImg").hide();
        showBubble('<br>Then pick a tradie on map.<br><img src="Images/marker.png" style="width:16px;vertical-align:middle ">', "next", true, function () {
            showBubble('<br>You can change settings anytime.', "next", true, function () {
                $("#divMenuImg").hide();
                showBubble('<br>You can search out people anytime.', "next", true, function () {
                    showBubble('<br>You can search out people anytime.', "Start", false, function () {
                    }, function () {
                        $("#coverDiv_btn").attr("style", "background-color:#5dade2;border-color:#5dade2");
                    });
                }, function () {

                });
            }, function () {
                $("#divMenuImg").show();
            });
        }, function () {
            $("#divMenuImg").show();
        });
    }, function () {
        $("#divCategoryImg").show();
    });
}

function setProfileToLocalStorege(firstName, lastName, birthday, gender, postCode, stateId, description) {
    localStorage.setItem("c_firstName", firstName);
    localStorage.setItem("c_lastName", lastName);
    localStorage.setItem("c_birthday", birthday);
    localStorage.setItem("c_gender", gender);
    localStorage.setItem("c_postCode", postCode);
    localStorage.setItem("c_stateId", stateId);
    localStorage.setItem("c_description", description);
}

function clearLocalStorage() {
    localStorage.removeItem("c_account");
    localStorage.removeItem("c_accountId");
    localStorage.removeItem("c_firstName");
    localStorage.removeItem("c_lastName");
    localStorage.removeItem("c_birthday");
    localStorage.removeItem("c_category");
    localStorage.removeItem("c_gender");
    localStorage.removeItem("c_categoryId");
    localStorage.removeItem("c_postCode");
    localStorage.removeItem("c_stateId");
    localStorage.removeItem("c_description");
    localStorage.removeItem("c_hasBindMobile");
    localStorage.removeItem("c_avatar");
}

function getCustomerName(firstName, lastName) {
    return firstName && lastName ? firstName + " " + lastName
                    : PageMessage.DefaultCustomerName;
}

function getTradieName(tradieName) {
    return tradieName || PageMessage.DefaultTradieName;
}

function getUpdateProfileType(event) {
    var type = getUrlParam(event.target.baseURI, "type");

    if (type == "social") {
        type = updateProfileType.social;
    } else {
        type = updateProfileType.normal;
    }

    return type;
}
