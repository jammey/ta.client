window.deviceReady = false;
var app_productIds = [];
var app_productNames = [];

// Wait for device API libraries to load
document.addEventListener("deviceready", onDeviceReady, false);
//var orginalWindow = window.open;
//window.open = function (url)
//{
//    orginalWindow(url, "toolbar=yes");
//}

function onGeolocationSuccess(position) {
    var x = position.coords.longitude;
    var y = position.coords.latitude;

    sessionStorage.setItem("c_gps-location-x", x);
    sessionStorage.setItem("c_gps-location-y", y);
}
function onGeolocationError(error) {
    //Messagebox.popup(error);
    Messagebox.popup("Please enable the Location Service");
}

function initStoreError(result) {
    alert("ERROR:" + error);
}

function initiOSStore()
{
    window.storekit.init({

        debug: true, /* Because we like to see logs on the console */

        purchase: function (transactionId, productId) {
            Ajax.getJson("RemoveAD", { accountId: getCurrentAccountId(), platform: 1, orderId: transactionId, productId: productId }, function (data) {
                if (data.IsSuccess && data.Data.IsPaid) {
                    $("#customer_removeAD").prev().remove();
                    $("#customer_removeAD").remove();
                    Messagebox.popup("Payment successfully");
                }
                else {
                    Messagebox.popup("Payment failed,please re-signin and check it again");
                }
            });
        },
        restore: function (transactionId, productId) {
            alert('restored: ' + productId);
        },
        restoreCompleted: function () {
            alert('all restore complete');
        },
        restoreFailed: function (errCode) {
            alert('restore failed: ' + errCode);
        },
        error: function (errno, errtext) {
            alert('Failed: ' + errtext);
        },
        ready: function () {

            Ajax.getJson("GetProductList", { appType: 0, platform: 1 }, function (data) {
                if (data.IsSuccess) {
                    for (var i = 0; i < data.Data.length; i++) {
                        app_productIds.push(data.Data[i].ProductId);
                    }
                    window.storekit.load(app_productIds, function (validProducts, invalidProductIds) {
                        $.each(validProducts, function (i, val) {
                            app_productIds = [];
                            app_productIds.push(val.id);
                            app_productNames.push(val.title);
                        });
                        if (invalidProductIds.length) {

                        }
                    });
                }
                else {
                    alert("Load the products failed");
                }
            })

        }
    });
}

function initAndroidStore() {
    inappbilling.init(function (result) {
        inappbilling.getAvailableProducts(function (r) {
            for (var i = 0; i < r.length; i++) {
                app_productIds.push(r[i].productId);
                app_productNames.push(r[i].title);
            }
        }, initStoreError)
        //Ajax.getJson("GetProductList", { appType: 1, platform: 0 }, function (data) {
        //    if (data.IsSuccess) {

        //    }
        //});

    }, initStoreError, { showLog: true });
}

// device APIs are available
function onDeviceReady() {
    
    window.deviceReady = true;
    if (window.plugins.jPushPlugin) {
        window.plugins.jPushPlugin.init();
        window.plugins.jPushPlugin.setDebugMode(true);
    }

    document.addEventListener("backbutton", function (e) {
        if ($.mobile.activePage.is('#pageIndex')) {
            e.preventDefault();
            Messagebox.confirm("Do you want to close the TA?", function (buttonIndex) {
                if (buttonIndex == 2) {
                    navigator.app.exitApp();
                }
            }, "Close the APP", ['NO', 'YES']);
        }
        else {
            navigator.app.backHistory();
        }
    }, false);

    //iOS7 status bar not overlays web view.
    StatusBar.overlaysWebView(false);
    StatusBar.backgroundColorByHexString("#0689C7");

    navigator.splashscreen.hide();

    if (!localStorage.getItem("c_device_platform")) {
        localStorage.setItem("c_device_platform", window.device.platform);
    }

    GetLatestVersion();

    checkConnection();

    if (window.device && localStorage.getItem("c_device_platform").toLowerCase() == "ios") {
        initiOSStore();
    } else if (window.device && localStorage.getItem("c_device_platform") == "Android") {
        initAndroidStore();
    }
}

function GetLatestVersion() {
    Ajax.getJson("GetLatestVersion", { appType: 0, platform: localStorage.getItem("c_device_platform") == "Android" ? 0 : 1 }, function (data) {
        if (data.IsSuccess) {
            var version = data.Data.Version;
            if (version != "" && version != Config.appVersion) {
                var log = "Version " + version + "\n" + data.Data.Upgrade_Log;
                Messagebox.confirm(log, function (buttonIndex) {
                    if (buttonIndex == 2) {
                        window.open(data.Data.DownloadUrl, '_system');
                    }
                }, "There is the new version ~", ['Discard', 'Upgrade']);
            }
        }
    });
}

var bgGeoSuccessCallBack = function (response) {
    GeoCommon.BgGeo.finish();
};

var bgGeoCallbackFn = function (location) {
    try {
        bgGeoSuccessCallBack.call(this);
    }
    catch (ex)
    { }

    try {
        iOSSendBGLocation(location);
    }
    catch (ex)
    { }
};

function iOSSendBGLocation(location) {
    var accountId = "";
    if (window.localStorage.getItem("c_accountId") != null) {
        accountId = window.localStorage.getItem("c_accountId");
    }
    else {
        return GeoCommon.BgGeo;
    }

    var data = { accountId: accountId, accountType: 0 };

    data.location = { longitude: location.longitude, latitude: location.latitude };

    var xhr = new XMLHttpRequest();
    function crossDomainRequest() {
        if (xhr) {
            xhr.open('Post', encodeURI(Config.rootPath + "UpdateCoordinate"), true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = handler;
            xhr.send(JSON.stringify(data));
        }
    }

    function handler(evtXHR) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
            }
        }
    }

    crossDomainRequest();
}

var bgGeoFailureFn = function (error) {
    GeoCommon.BgGeo.stop();
    GeoCommon.BgGeo.start();
}

var GeoCommon = GeoCommon ? GeoCommon : {};
GeoCommon = {
    BgGeo: null,
    StartReportLocation: function () {
        if (!GeoCommon.BgGeo) {
            GeoCommon.BgGeo = window.plugins.backgroundGeoLocation;
        }

        var accountId = "";
        if (window.localStorage.getItem("c_accountId") != null) {
            accountId = window.localStorage.getItem("c_accountId");
        }
        else {
            return GeoCommon.BgGeo;
        }

        var data = { accountId: accountId, accountType: 0 };

        GeoCommon.BgGeo.configure(bgGeoCallbackFn, bgGeoFailureFn, {
            url: encodeURI(Config.rootPath + "UpdateCoordinate"), // <-- Android ONLY:  your server url to send locations to 
            params: data,
            desiredAccuracy: 100,
            stationaryRadius: 0,
            distanceFilter: 200,
            locationTimeout: 3000,
            //distanceFilter: 0,
            //locationTimeout: 30,
            notificationTitle: 'Ta',
            notificationText: 'Location updating',
            activityType: 'AutomotiveNavigation',
            debug: false,
            stopOnTerminate: true
        });

        GeoCommon.BgGeo.start();
        return GeoCommon.BgGeo;
    },
    StopReport: function () {
        try {
            GeoCommon.BgGeo.stop();
        }
        catch (ex) { }
    }
}

function checkConnection() {

    if (!window.deviceReady) {

        return true;
    }


    var networkState = navigator.connection.type;

    if (networkState == Connection.NONE) {

        Messagebox.popup("No internet connection");
        return false;
    }

    return true;
}

function objToArray(obj) {
    var arr = [];
    $.each(obj, function () {
        arr.push(this);
    });

    return arr;
}

function changePage(url) {
    url = encodeURI(url);
    if (url.substr(0, 1) == "#") {
        $.mobile.navigate(url, {
            transition: "slide"
        });
    }
    else {
        $.mobile.navigate(url, {
            transition: "slide"
        });
    }
}

function refreshPage() {
    jQuery.mobile.changePage(window.location.href, {
        allowSamePageTransition: true,
        transition: 'none',
        reloadPage: true
    });
}

function getUrlParam(url, name) {
    url = decodeURI(url);
    if (url.indexOf("?") > -1) {
        url = url.split("?")[1];
    }

    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = url.match(reg);
    if (r != null) return r[2]; return null;
}

var Messagebox = Messagebox ? Messagebox : {};
Messagebox = {

    alert: function (message, alertCallback, title, buttonName) {
        if (window.deviceReady && navigator) {
            if (!buttonName) {
                buttonName = "OK";
            }
            navigator.notification.alert(message, alertCallback, title, buttonName);
        }
        else {
            alert(message);
        }
    },

    //options.duration, // ‘short’, ‘long’
    //options.position, // ‘top’, ‘center’, ‘bottom’
    //options.successCallback, // optional succes function
    //options.errorCallback // optional error function
    popup: function (message, options) {
        if (!message) {
            return;
        }

        if (window.deviceReady) {
            var defaultOptions = {
                duration: "short",
                position: "center",
                successCallback: function () { },
                errorCallback: function () { }
            }

            options = $.extend(options, defaultOptions);

            window.plugins.toast.show(
                  message,
                  options.duration,
                  options.position,
                  options.successCallback,
                  options.errorCallback
          );
        }
        else {
            alert(message);
        }
    },

    confirm: function (message, confirmCallback, title, buttonLabels) {
        if (window.deviceReady && navigator) {
            if (!buttonLabels) {
                buttonLabels = ['Cancel', 'OK']
            }
            navigator.notification.confirm(message, confirmCallback, title, buttonLabels);
        }
        else {
            window.confirm(message) ? confirmCallback(1) : confirmCallback(2);
        }
    },

    prompt: function (message, promptCallback, title, buttonLabels) {
        if (window.deviceReady && navigator) {
            if (!buttonLabels) {
                buttonLabels = ['Cancel', 'OK']
            }
            navigator.notification.prompt(message, promptCallback, title, buttonLabels)
        } else {
            alert("Not implemented this function on windows");
        }
    },

    showLoading: function () {
 
        if (window.plugins.spinnerDialog) {
            
            window.plugins.spinnerDialog.show(null, null, true);
        }
        else {
            $.mobile.loading('show', {
                text: '',
                textVisible: false,
                theme: 'a',
                html: ""
            });
        }
    },

    hideLoading: function () {
        if (window.plugins) {
            window.plugins.spinnerDialog.hide();
        }
        else {
            $.mobile.loading('hide', {
                textVisible: false
            }); window.localStorage.getItem("c_key")
        }
    }
};

var Ajax = (function () {
    var sendRequest = function (url, data, callback, needShowLoading, type) {
        needShowLoading = typeof (needShowLoading) == "undefined" ? true : needShowLoading;
        type = type || "Get";
        var isNetworkWorked = checkConnection();
        
        if (!isNetworkWorked) {
            
            return;
        }
        
        /*Production up API invoke*/
        var apiUrl;
        
        if (url.indexOf("http://") > -1 || url.indexOf("https://") > -1) {
            apiUrl = url;
        } else {
            apiUrl = Config.rootPath + url;
        }

        var ajaxOptions = {
            url: apiUrl,
            data: data,
            type: type,
            success: function (result) {
                if ($.isFunction(callback)) {
                    callback(result.d);
                }
            },
            dataType: "json",
            timeout: 15000,
            beforeSend: function () {
                if (!needShowLoading) {
                    return;
                }

                var pageLoadingCount = parseInt($("#pageLoadingCount").val());
                pageLoadingCount++;
                if (pageLoadingCount == 1) {
                    Messagebox.showLoading()
                }
            },
            complete: function () {
                if (!needShowLoading) {
                    return;
                }

                var pageLoadingCount = parseInt($("#pageLoadingCount").val());
                pageLoadingCount--;
                if (pageLoadingCount <= 0) {
                    Messagebox.hideLoading()
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                if (window.deviceReady) {
                    Messagebox.popup("call API error");
                }
                else {
                    Messagebox.popup("Call API error:" + textStatus);
                }
            }
        };

        if (type == "Post") {
            ajaxOptions.contentType = "application/json";
            ajaxOptions.data = JSON.stringify(data);
        }

        $.ajax(ajaxOptions);
    }

    return {
        getJson: function (url, data, callback, needShowLoading) {
            
            return sendRequest(url, data, callback, needShowLoading);
        },
        postJson: function (url, data, callback, needShowLoading) {
            return sendRequest(url, data, callback, needShowLoading, "Post");
        }
    };
})();

function showBubble(html, buttonText, showSkip, callback, beforeShow) {
    $("#coverDiv #divBubble p").html(html);
    if (buttonText) {
        $("#coverDiv #divBubble a").text(buttonText);
    }

    $("#coverDiv #divBubble a").off("click").on("click", function () {
        $("#coverDiv").hide();
        if ($.isFunction(callback)) {
            callback();
        }
    });

    showSkip ? $("#coverDiv .skip").css("display", "block") : $("#coverDiv .skip").css("display", "none");

    if ($.isFunction(beforeShow)) {
        beforeShow();
    }

    $("#coverDiv").show();
    $("#coverDiv_btn").buttonMarkup();
    $("#coverDiv_btn").css("width", "80px");
}

function getCurrentAccountId() {
    return window.localStorage.getItem("c_accountId");
}

function getPhoto(source, onPhotoURISuccess, onPhotoURIFailed) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onPhotoURIFailed, {
        quality: 20,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: source,
        correctOrientation: true
    });
}

function MD5(obj) {
    return $.md5(obj);
}


//add callback if need 
$.fn.emptyValidate = function (message) {
    if ($.trim($(this).val()) == "") {
        Messagebox.popup(message);
        return false;
    }
    return true;
}

$.fn.mobileValidate = function (message) {
    var val = $.trim($(this).val());
    if (val.length > 10 || val.length < 9) {
        Messagebox.popup(message);
        return false;
    }

    return true;
}

$.fn.passwordValidate = function (message) {
    var val = $.trim($(this).val());
    if (val.length < 6 || val.length > 32) {
        Messagebox.popup(message);
        return false;
    }

    return true;

    //reg = /^[a-zA-Z0-9]{6,16}$/;
    //if (!reg.test($(this).val())) {
    //    Messagebox.popup(message);
    //    return false;
    //}
    //return true;
}

Date.prototype.format = function (format) {
    var o =
    {
        "M+": this.getMonth() + 1, //month  
        "d+": this.getDate(),    //day  
        "h+": this.getHours(),   //hour  
        "m+": this.getMinutes(), //minute  
        "s+": this.getSeconds(), //second  
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter  
        "S": this.getMilliseconds() //millisecond  
    }
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
    return format;
}

jQuery.extend(
            {
                wcfDate2JsDate: function (wcfDate) {
                    var date = new Date(parseInt(wcfDate.substring(6)));
                    return date;
                },
                jsDate2WcfDate: function (jsDate) {
                    return "\/Date(" + jsDate.getTime() + "+0000)\/";
                }
            }
        );

function stringToDate(value) {
    var fullDate = value.split(" ")[0].split("-");
    var fullTime = value.split(" ")[1].split(":");

    var newDate = new Date(fullDate[0], fullDate[1] - 1, fullDate[2], (fullTime[0] ? fullTime[0] : 0), (fullTime[1] ? fullTime[1] : 0), (fullTime[2] ? fullTime[2] : 0));

    return newDate;
}

function stringToShortDate(value) {
    var fullDate = value.split(" ")[0].split("-");

    var newDate = new Date(fullDate[0], fullDate[1] - 1, fullDate[2]);

    return newDate;
}

function imageLazyload(container, loadedCallback) {
    $("img.lazy").lazyload({
        container: container,
        load: function () {
            if (loadedCallback)
                loadedCallback();
        }
    });
}

//Pull down contrl
var listScroller = listScroller ? listScroller : {};
listScroller = {
    createInstance: function (wrapperId, loadMoreCallback) {
        var wrapperContainer = $("#" + wrapperId);
        pullDownEl = wrapperContainer.find('#pullDown')[0];
        pullDownOffset = pullDownEl.offsetHeight;

        var result = new iScroll(wrapperId, {
            //scrollbarClass: 'myScrollbar', 
            useTransition: false,
            topOffset: pullDownOffset,
            onRefresh: function () {
                if (pullDownEl.className.match('loading')) {
                    pullDownEl.className = '';
                }
            },
            onScrollMove: function () {
                if (this.y > 5 && !pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'flip';
                    this.minScrollY = 0;
                } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                    pullDownEl.className = '';
                    this.minScrollY = -pullDownOffset;
                }
            },
            onScrollEnd: function () {
                $("img.lazy").lazyload(wrapperContainer);

                if (pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'loading';

                    if (loadMoreCallback)
                        loadMoreCallback();
                }
            }
        });

        return result;
    }
};

function scrollerToBottom(scroller, selector) {
    scroller.scrollToElement(selector, 200);
}
