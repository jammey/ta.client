var tradieInfoSwiper;
var messageSwiper;
var holdPosition = 0;
var markerArray = [];
var gMap;
var lat;
var lng;
var debugLat = "-33.8673889";
var debugLng = "151.20844120000004";
//var debugLat = "34.2237749538001";
//var debugLng = "108.883155840459";
var image = 'Images/marker.png';
var pageMain_accountId;
var pageMain_accountName;
var currentTradieId = 0;
var pageMain_Avatar;
var pageMain_pageStart;
var isGoogleMapInit = false;
var refreshGoogleMapInterval;
var getNewMessageInterval;

var service;

function setTradieRating(number) {
    var ratingHtml = "";

    var rating = parseFloat(number);
    for (var k = 0; k < rating; k++) {
        ratingHtml += '<img src="Images/iconfont-wujiaoxingYellow.png" style="width:16px;" />';
    }

    for (var k = 0; k < 5 - rating; k++) {
        ratingHtml += '<img src="Images/iconfont-wujiaoxing.png" style="width:16px;" />';
    }

    $("#tradieInfo #pageMain_divRating").html(ratingHtml);
}

function pageMain_initProfile() {
    $("#pageMain_txtFirstName").val(localStorage.getItem("c_firstName"));
    $("#pageMain_txtLastName").val(localStorage.getItem("c_lastName"));
    $("#pageMain_txtPostCode").val(localStorage.getItem("c_postCode"));
    $("#pageMain_dateBirthday").val($.wcfDate2JsDate(localStorage.getItem("c_birthday")).format("yyyy-MM-dd"));

    if (localStorage.getItem("c_gender") == $("#pageMain_male").data("gender-value")) {
        $("#pageMain_male").removeClass("btnDeactive").addClass("btnActive");
    }

    $("#pageMain_selectState").val(localStorage.getItem("c_stateId")).selectmenu("refresh");
    $("#pageMain_Surburb").val(localStorage.getItem("c_description"));
}

var hasStartReportLocation = false;

$(document).on("pageinit", "#pageMain", function (event, ui) {
    if (localStorage.getItem("c_hasBindMobile") == "false") {
        $("#liBindMobile").show();
    }
               
    if (localStorage.getItem("c_isPaid") && localStorage.getItem("c_isPaid") == "true") {
            $("#customer_removeAD").prev().remove();
            $("#customer_removeAD").remove();
   }

    $("#pageMain_version").text(Config.appVersion);

    isGoogleMapInit = false;
    var pushEnable = localStorage.getItem("c_pushEnable");
    var visableEnable = localStorage.getItem("c_VisableEnable");
    var locationEnable = localStorage.getItem("c_LocationEnable");
    if (pushEnable) {
        $("#selectPush").val(pushEnable).flipswitch("refresh");
    }
    if (visableEnable) {
        $("#selectVisable").val(visableEnable).flipswitch("refresh");
    }
    if (locationEnable) {
        $("#selectLocation").val(locationEnable).flipswitch("refresh");
    }

    if (!hasStartReportLocation && $("#selectPush").val() == settingStatus.On) {
        try {
            GeoCommon.StartReportLocation();
        }
        catch (ex)
        { }

        hasStartReportLocation = true;
    }

    pageMain_Avatar = "";
    pageMain_pageStart = 0;
    var selfPage = $(this);
    var headerHeight = 44;
    var footHeight = 38;
    var informationHeight = 75;
    var positionHeight = 0;
    var pageHeight = document.body.clientHeight;
    var fixedHeight = headerHeight + footHeight + informationHeight + positionHeight;
    $("#map_canvas").css("height", pageHeight - fixedHeight);

    var accountAvatar = localStorage.getItem("c_avatar");
    if (accountAvatar) {
        $("#pageMain_CustomerPhoto").attr("src", accountAvatar);
    }

    service = new google.maps.DistanceMatrixService();

    function changeToChatPage(messageType) {
        changePage("chat.html?accountId=" + pageMain_accountId + "&messageType=" + messageType + "&accountName=" + pageMain_accountName);
    }

    selfPage.on("click", "#divSendMessage a", function () {
        changeToChatPage($(this).data("message-type"));
    });

    selfPage.on("click", "#pageMain_btnBindMobile", function () {
        if (!$("#pageMain_txtBindMobile").emptyValidate(WarningMessage.MobileRequired)) {
            return;
        }

        if (!$("#pageMain_txtBindMobile").mobileValidate(WarningMessage.InvalidMobile)) {
            return;
        }

        if (!$("#pageMain_txtPassword").emptyValidate(WarningMessage.PasswordRequired)) {
            return;
        }

        if (!$("#pageMain_txtPassword").passwordValidate(WarningMessage.InvalidPassword)) {
            return;
        }

        var mobile = $.trim($("#pageMain_txtBindMobile").val());
        var password = $.trim($("#pageMain_txtPassword").val());
        Ajax.getJson("SocialBindMobile", {
            accountId: getCurrentAccountId(),
            mobile: mobile,
            password: password,
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
                    localStorage.setItem("c_hasBindMobile", "true");

                    localStorage.setItem("c_account", mobile);
                    $("#liCustomerInfo").find("div").eq(1).text(localStorage.getItem("c_account"));
                    $("#liBindMobile").hide();
                    $("#panelBindMobileMenu").trigger("click");
                    Messagebox.popup(SuccessfulMessage.BindMobile);
                }
            }
        });
    });

    Ajax.getJson("GetStates", {}, function (data) {
        if (data.IsSuccess) {
            var res = data.Data;
            $("#pageMain_selectState").append("<option value=''>" + PageMessage.SelectState + "</option>");
            for (var i = 0; i < res.length; i++) {
                selfPage.find("#pageMain_selectState").append("<option value='" + res[i].Id + "'>" + res[i].StateName + "</option>");
            }

            $("#pageMain_selectState").selectmenu("refresh");
            pageMain_initProfile();
        } else {

        }
    });

    Ajax.getJson("GetCategories", {}, function (data) {
        if (data.IsSuccess) {
            var categroy = data.Data;
            for (var i = 0; i < categroy.length; i++) {
                var theme = "c";
                if (localStorage.getItem("c_category") != null && localStorage.getItem("c_category") == categroy[i].CategorieName) {
                    theme = "f";
                }
                var btn = "<a href=\"\" data-role=\"button\" data-theme='" + theme + "' categoryId='" + categroy[i].Id + "'>" + categroy[i].CategorieName + "</a>";
                $("#popupCategory").append(btn).trigger('create');
            }

            $("#popupCategory a").on("click", function () {
                $("#tradieInfo").hide();
                $("#divMessage").show();
                localStorage.setItem("c_category", $(this).text());
                localStorage.setItem("c_categoryId", $(this).attr("categoryId"));
                $("#popupCategory a").removeClass("ui-btn-f").addClass("ui-btn-c");
                $(this).removeClass("ui-btn-c").addClass("ui-btn-f");
                $("#popupCategory").popup("close");
                $("#aCategory img").removeClass("aCategory").addClass("aCategory1");

                initOthersPosition();
            });
        }
    });

    window.setTimeout(function () {
        initGoogleMap(function () {
            if (localStorage.getItem("c_categoryId")) {
                initOthersPosition();
            }
        });
    }, 0);

    refreshGoogleMapInterval = window.setInterval(function () {
        refreshGoogleMap();
    }, Config.refreshGoogleMapTime);
});

$(document).on("pagehide", "#pageMain", function (event, ui) {
    window.clearInterval(refreshGoogleMapInterval);
    refreshGoogleMapInterval = null;

    window.clearInterval(getNewMessageInterval);
    getNewMessageInterval = null;
});

function initGoogleMap(callback) {
    if (window.deviceReady) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $('#map_canvas').gmap({
                'center': center, 'zoom': Config.googleMapZoom, 'disableDefaultUI': true, 'callback': function () {
                    gMap = this;
                    gMap.addMarker({ 'position': center });
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;

                    if (callback) {
                        callback();
                    }

                    isGoogleMapInit = true;
                }
            });
            $('#map_canvas').gmap('refresh');

            if (isGoogleMapInit) {
                if (callback) {
                    callback();
                }
            }

        }, onGeolocationError, Config.getCurrentPositionOption);
    }
    else {
        var center = new google.maps.LatLng(debugLat, debugLng);

        $('#map_canvas').gmap({
            'center': center, 'zoom': Config.googleMapZoom, 'disableDefaultUI': true, 'callback': function () {
                gMap = this;
                gMap.addMarker({ 'position': center });
                lat = debugLat;
                lng = debugLng;

                if (callback) {
                    callback();
                }

                isGoogleMapInit = true;
            }
        });

        //$("#map_canvas").gmap('clear', 'overlays > Circle');
        //$('#map_canvas').gmap('addShape', 'Circle', {
        //    'strokeColor': "#10baf1",
        //    'strokeOpacity': 0.5,
        //    'strokeWeight': 2,
        //    'fillColor': "#10baf1",
        //    'fillOpacity': 0.2,
        //    'center': center,
        //    'radius': 400,
        //    'clickable': false
        //});

        $('#map_canvas').gmap('refresh');

        if (isGoogleMapInit) {
            if (callback) {
                callback();
            }
        }
    }
}

function refreshGoogleMap() {
    initGoogleMap(function () {
        if (localStorage.getItem("c_categoryId")) {
            initOthersPosition();
        }
    });
}

function ClearMarkers() {
    $('#map_canvas').gmap('clear', 'markers');
    gMap.addMarker({ 'position': new google.maps.LatLng(lat, lng) });
};

function initOthersPosition() {
    Ajax.getJson("GetTradiesByCategoryId", { categoryId: localStorage.getItem("c_categoryId"), currentLatitude: lat, currentLongitude: lng }, function (data) {
        if (!data.IsSuccess) {
            Messagebox.popup(data.Message);
            return;
        }

        ClearMarkers();

        for (var i = 0; i < data.Data.length; i++) {
            var d = data.Data[i];

            var _marker = gMap.addMarker(
                {
                    'position': d.CurrentLatitude + "," + d.CurrentLongitude,
                    'icon': image,
                    "title": getTradieName(d.TradieName),
                    "desc": d.Description,
                    "rating": d.AvgRating,
                    "accountId": d.T_AccountId
                }).click(function () {
                    pageMain_accountId = $(this).attr("accountId");
                    pageMain_accountName = $(this).attr("title");
                    $("#divMessageType").popup("open", { "transition": "flip" })

                    Messagebox.showLoading();
                    $(".triangle-isosceles").show();
                    $("#divMessage").hide();
                    $("#tradieInfo").show();
                    currentTradieId = $(this).attr("accountId");
                    if (tradieInfoSwiper) {
                        tradieInfoSwiper.reInit();
                        //fixed the bug of if reinit the swiper,the pagination item is not actived
                        $(".pagination span").first().addClass("swiper-visible-switch swiper-active-switch");
                    }

                    if ($(this).attr("title")) {
                        $("#tradieInfo .tradieTitle").text($(this).attr("title"));
                    }

                    $("#tradieInfo #pageMain_divDesc").empty();
                    if ($(this).attr("desc")) {
                        $("#tradieInfo #pageMain_divDesc").text($(this).attr("desc"));
                    }

                    setTradieRating($(this).attr("rating"));

                    var origin1 = new google.maps.LatLng(lat, lng);
                    var origin2 = new google.maps.LatLng(lat, lng);
                    var destinationA = new google.maps.LatLng(d.CurrentLatitude, d.CurrentLongitude);
                    var destinationB = new google.maps.LatLng(d.CurrentLatitude, d.CurrentLongitude);
                    service.getDistanceMatrix(
                      {
                          origins: [origin1, origin2],
                          destinations: [destinationA, destinationB],
                          travelMode: google.maps.TravelMode.DRIVING,
                          avoidHighways: false,
                          avoidTolls: false
                      }, getDistanceMatrixCallback);
                });

        }
    }, false);
}

function getDistanceMatrixCallback(response, status) {
    Messagebox.hideLoading();
    $("#tradieDistance").text(response.rows[0].elements[0].distance.text + "-" + response.rows[0].elements[0].duration.text)
}

//https://developers.google.com/maps/documentation/javascript/distancematrix?hl=zh-CN
$(document).on("pageshow", "#pageMain", function (event, ui) {

    localStorage.removeItem("c_category");
    localStorage.removeItem("c_categoryId");
    var _self = this;
    tradieInfoSwiper = new Swiper('#tradieInfo', {
        pagination: '.pagination',
        loop: false,
        grabCursor: true,
        paginationClickable: false
    });
    messageSwiper = new Swiper('#messages', {
        slidesPerView: 'auto',
        mode: 'vertical',
        watchActiveIndex: true,
        onTouchStart: function () {
            holdPosition = 0;
        },
        onResistanceBefore: function (s, pos) {
            holdPosition = pos;
        },
        onTouchEnd: function () {
            if (holdPosition > 100) {
                // Hold Swiper in required position
                //messageSwiper.setWrapperTranslate(0, 100, 0)

                ////Dissalow futher interactions
                //messageSwiper.params.onlyExternal = true

                //Show loader
                $('#preloader').show();
                getNewMessage(function () {
                    $('#preloader').hide();
                    $("#messages ul").listview().listview("refresh");
                });
            }
        }
    });

    $(_self).on("click", "#customerMain_RemoveAD", function () {
        if (window.device && window.device.platform.toLowerCase().indexOf("android") >= 0) {
            inappbilling.buy(function (result) {
                inappbilling.consumePurchase(function (r) { }, initStoreError, app_productIds[0]);
            }, initStoreError, app_productIds[0]);
        } else if (window.device && window.device.platform.toLowerCase().indexOf("ios") >= 0) {
              
            //window.storekit.restore();
            window.storekit.purchase(app_productIds[0], 1);
        }
    });

    $(_self).on("click", "#pageMain_messageList li", function () {
        var selfEle = $(this);
        changePage("chat.html?accountId=" + selfEle.data("from-account-id") + "&messageType=0&accountName=" + selfEle.find("#pageMain_accountName").text());
    });

    var getNewMessage = function (callback, needShowLoading) {
        Ajax.getJson("GetAccountMessage", {
            accountId: getCurrentAccountId(),
            pageStart: 0,
            pageNumber: 10000
        }, function (data) {
            if (!data.IsSuccess) {
                Messagebox.popup(data.Message);
                return;
            }

            $("#messages ul").empty();
            for (var i = 0; i < data.Data.Source.length; i++) {
                var m = data.Data.Source[i];
                var temp = $("#divTemplete ul").clone();

                if (!m.IsRead) {
                    temp.find("#pageMain_unreadImage").show();
                }

                var tempHtml = temp.html();
                tempHtml = tempHtml.replace("{1}", m.AccountName);
                tempHtml = tempHtml.replace("{2}", m.MessageContent);
                tempHtml = tempHtml.replace("{3}", $.wcfDate2JsDate(m.SendTime).format("dd/MM hh:mm"));
                tempHtml = tempHtml.replace("{4}", "swiper-slide");
                tempHtml = tempHtml.replace("{5}", m.AccountId);
                $("#messages ul").prepend(tempHtml);
            }

            if (data.Data.UnreadTotalNumber) {
                $("#pageMain_unreadTotalNumber").show();
            }

            $("#pageMain_unreadCount").text(data.Data.UnreadTotalNumber + " unread");

            $("#messages ul").listview("refresh");
            $("#toppaneloverlaylist").panel().trigger("updatelayout");
            pageMain_pageStart += 1;

            if (messageSwiper) {
                messageSwiper.reInit(true, true);
            }

            if ($.isFunction(callback)) {
                callback();
            }

        }, typeof (needShowLoading) == "undefined" ? true : needShowLoading)
    }

    var pageMain_uploadPicSuccess = function (res) {
        Messagebox.hideLoading();
        var data = JSON.parse(res.response.replace("(", "").replace(")", ""));
        if (data.IsSuccess) {
            var img = $("#pageMain_CustomerPhoto");
            img.data("updated", "true");
            img.attr("src", pageMain_Avatar);
        } else {
            Messagebox.popup(data.Message);
        }
    }

    var pageMain_uploadPicFail = function (res) {
        Messagebox.hideLoading();
        Messagebox.popup("Upload photo failed");
    }

    var pageMain_uploadPhoto = function (imageUrl) {
        Messagebox.showLoading();

        var fileName = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);

        if (fileName.indexOf(".jpg") < 0) {
            fileName += ".jpg"
        }

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileName;
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;

        var params = {};
        params.accountId = getCurrentAccountId();
        options.params = params;

        var ft = new FileTransfer();
        ft.upload(imageUrl, Config.chatHubRootPath + "UploadThumbnail/Post", pageMain_uploadPicSuccess, pageMain_uploadPicFail, options);
        //预留接口，如果需要显示上传进度的话
        //ft.onprogress = uploadProgressing;
    };

    var getPhotoFrom = function (type) {
        var getType = navigator.camera.PictureSourceType.SAVEDPHOTOALBUM;
        if (type == 2) {
            getType = navigator.camera.PictureSourceType.CAMERA;
        }
        getPhoto(getType, function (imageUrl) {
            pageMain_Avatar = imageUrl;
            pageMain_uploadPhoto(imageUrl);
        }, function () {

        });
    }

    var updatePhotoCallback = function (index) {
        switch (index) {
            case 1:
            case 2:
                getPhotoFrom(index);
                break;
        }
    };

    var isFirstRunMap = localStorage.getItem("c_isFirstRunMap");
    if (!isFirstRunMap || isFirstRunMap == "true") {
        showBubbleOnTA();
        localStorage.setItem("c_isFirstRunMap", "false");
    }

    $("#aCategory img").off("click").on("click", function () {
        if ($(this).hasClass("aCategory")) {
            $(this).removeClass("aCategory").addClass("aCategory1");

        } else {
            $(this).removeClass("aCategory1").addClass("aCategory");
        }
    });

    $("#standardFooter").off("click").on("click", function () {
        $("#toppaneloverlaylist").trigger("updatelayout");
        $("#messages ul").listview().listview("refresh");

        $("#toppaneloverlaylist").panel("open");
    })

    $("#divSendMessage a.messageIcon").off("click").on("click", function () {
        //changePage("Chat.html");
    });

    $("#btnRate").off("click").on("click", function (e) {
        e.stopPropagation();
        Ajax.getJson("IsRecognition", { customerId: getCurrentAccountId(), tradieId: currentTradieId }, function (data) {
            if (data.IsSuccess && data.Data.IsRecognition) {
                $("#divSendMessage").hide();
                $("#divRateForTradie").show();
                var stars = $("#divRateForTradie img");
                for (var i = 0; i < parseInt(data.Data.LastScore) ; i++) {
                    stars.eq(i).prop("src", "Images/iconfont-wujiaoxingYellow.png");
                }
            } else {
                Messagebox.popup("Please contact with the traide before rating");
                return;
            }

        });
    });

    $("#btnRateNo").off("click").on("click", function (e) {
        e.stopPropagation();
        $("#divRateForTradie").hide();
        $("#divSendMessage").show();
    });

    $("#btnRateYes").off("click").on("click", function (e) {
        e.stopPropagation();
        var _rateNumber = parseFloat($("#divRateForTradie").data("count"));
        Ajax.getJson("UpdateFeedback", { customerId: getCurrentAccountId(), tradieId: currentTradieId, score: _rateNumber }, function (data) {
            if (!data.IsSuccess) {
                Messagebox.popup(data.Message);
                return;
            }

            setTradieRating(data.Data.AvgScore);
            $("#divRateForTradie").hide();
            $("#divSendMessage").show();
        });
    });

    $("#pageMain_male").off("click").on("click", function () {
        if ($(this).hasClass("btnDeactive")) {
            $(this).removeClass("btnDeactive").addClass("btnActive");
            $("#pageMain_female").removeClass("btnActive").addClass("btnDeactive");
        }
    });

    $("#pageMain_female").off("click").on("click", function () {
        if ($(this).hasClass("btnDeactive")) {
            $(this).removeClass("btnDeactive").addClass("btnActive");
            $("#pageMain_male").removeClass("btnActive").addClass("btnDeactive");
        }
    });

    $("#pageMain_CheckUpdate").off("click").on("click", function () {
        GetLatestVersion();
    });

    $("#divMessageType_close").off("click").on("click", function () {
        $("#divMessageType").popup("close");
    })

    $("#pageMain_ClearCache").off("click").on("click", function () {
        Messagebox.popup("Clear cache successful");
    });

    $("#selectPush").off("change").on("change", function (event) {
        localStorage.setItem("c_pushEnable", $(this).val());
    });

    $("#selectVisable").off("change").on("change", function () {
        var self = $(this);

        Ajax.getJson("UpdateAccountVisableStatus", { "accountId": getCurrentAccountId(), "isVisable": self.val() == settingStatus.On ? true : false }, function (data) {
            if (data.IsSuccess) {
                localStorage.setItem("c_VisableEnable", self.val());
            } else {
                Messagebox.popup(data.Message);
            }
        });
    });

    $("#selectLocation").off("change").on("change", function () {
        localStorage.setItem("c_LocationEnable", $(this).val());
    });

    //$(_self).on('swiperight', function (event) {
    //    if ($(event.target).hasClass("ui-flipswitch-on")) {
    //        $("#panelMenu").panel("open");
    //    }
    //});

    $("#pageMain_btnSave").off("click").on("click", function () {
        var pageMain_txtFirstName = $.trim($("#pageMain_txtFirstName").val());
        var pageMain_txtLastName =  $.trim($("#pageMain_txtLastName").val());
        var gender = $("#pageMain_gender a.btnActive").data("gender-value") || 0;
        var pageMain_dateBirthday = $("#pageMain_dateBirthday").val();
        var pageMain_txtPostCode = $("#pageMain_txtPostCode").val();
        var pageMain_selectState = $("#pageMain_selectState").val() || 0;
        var description = $("#pageMain_Surburb").val();

        if (!$("#pageMain_txtFirstName").emptyValidate(WarningMessage.FirstNameRequired)) {
            return;
        }

        if (!$("#pageMain_txtLastName").emptyValidate(WarningMessage.LastNameRequired)) {
            return;
        }

        if (pageMain_txtPostCode.length > 4) {
            Messagebox.popup("The postcode must be 4 bits");
            return;
        }

        Ajax.getJson("UpdateCustomerProfile", {
            accountId: getCurrentAccountId(),
            firstName: pageMain_txtFirstName,
            lastName: pageMain_txtLastName,
            birthday: pageMain_dateBirthday,
            gender: gender,
            postCode: pageMain_txtPostCode,
            stateId: pageMain_selectState,
            description: description
        }, function (data) {
            if (data.IsSuccess) {
                setProfileToLocalStorege(pageMain_txtFirstName, pageMain_txtLastName, pageMain_dateBirthday, gender, pageMain_txtPostCode,
                 pageMain_selectState, description);

                var accountName = getCustomerName(pageMain_txtFirstName, pageMain_txtLastName);
                $("#liCustomerInfo").find("div").first().text(accountName);
                $("#pageMain_aTitle").text(accountName);
                Messagebox.popup("Updated profile successful");
            }
            else {
                Messagebox.popup(data.Message);
            }
        });
    });

    $("#pageMain_btnTopRight").off("click").on("click", function () {
        $("#panelMenu").popup("open");
        return;

        Ajax.getJson("GetCustomerDetail", { accountId: getCurrentAccountId() }, function (data) {
            if (!data.IsSuccess) {
                Messagebox.popup(data.Message);
                return;
            }

            if (data.Data) {
                $("#pageMain_CustomerPhoto").attr("src", data.Data.Thumbnail || "");
                $("#pageMain_txtFirstName").val(data.Data.FirstName || "");
                $("#pageMain_txtLastName").val(data.Data.LastName || "");
                if (data.Data.Customer)
                    $("#pageMain_txtPostCode").val(data.Data.Customer.PostCode || "");
                if (data.Data.State)
                    $("#pageMain_selectState").val(data.Data.State.Id || "");

                //set cash quantity and membership time
                if (data.Data.IsPaid)
                {
                    $("#customer_removeAD").hide();
                }
            }

            //$("#pageMain_dateBirthday").val($.wcfDate2JsDate(data.Data.Customer.Birthday).format("yyyy-d-m"));
            $("#pageMain_selectState").selectmenu("refresh");
            $("#panelMenu").panel("open");
        });
    });

    $("#liOpenSetting").off("click").on("click", function () {
        var _that = $(this);
        if (_that.attr("state") == "0") {

            $("img", _that).attr("src", "Images/iconfont-jiantou2.png");
            _that.attr("state", "1");
            $("#pageMain_updateProfile").slideToggle("slow", function () {
                $("#listviewMenu").hide();
            });
        } else {
            $("img", _that).attr("src", "Images/iconfont-jiantou1.png");
            _that.attr("state", "0");
            $("#listviewMenu").show();
            $("#pageMain_updateProfile").slideToggle("slow");
        }
    });

    $("#btnSignout").off("click").on("click", function () {
        clearLocalStorage();
        changePage("index.html");
    });

    $("#liCustomerPhoto").off("click").on("click", function () {
        var options = {
            'title': 'Upload your avatar',
            'buttonLabels': ['Album', 'Camera'],
            'androidEnableCancelButton': true, // default false
            'winphoneEnableCancelButton': true, // default false
            'addCancelButtonWithLabel': 'Cancel'
        };

        window.plugins.actionsheet.show(options, updatePhotoCallback);
    });

    var firstName = localStorage.getItem("c_firstName");
    var lastName = localStorage.getItem("c_lastName");

    var accountName = getCustomerName(firstName, lastName);;
    $("#pageMain_aTitle").text(accountName);
    Ajax.getJson("GetAd", { accountId: getCurrentAccountId(),categoryName:localStorage.getItem("c_category") }, function (data) {
        if (data.IsSuccess && data.Data)
        {
            $(".taAds #liCustomerPhoto").attr("src", "Images/" + data.Data.Thumbnail);
            $("#liCustomerInfo").find("div").first().text(data.Data.TradieName);
            $("#liCustomerInfo div:last").text(localStorage.getItem("c_account") || "");
        }
        else
        {
            $(".taAds").remove();
        }
    });
    
    getNewMessage();
    getNewMessageInterval = window.setInterval(function () {
        getNewMessage(null, false);
    }, Config.refreshUnreadMessage);

    $("#divRateForTradie div img").on("vmousemove", function (event) {
        var index = $("#divRateForTradie img").index($(this));
        console.log(index);
        $("#divRateForTradie").find("img:lt(" + index + ")").prop("src", "Images/iconfont-wujiaoxingYellow.png");
        $("#divRateForTradie").find("img:eq(" + index + ")").prop("src", "Images/iconfont-wujiaoxingYellow.png");
        $("#divRateForTradie").find("img:gt(" + index + ")").prop("src", "Images/iconfont-wujiaoxing.png");
        $("#divRateForTradie").data("count", index);
    });

});