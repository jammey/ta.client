var pageChat_messageType = messageTypeEnum.Text;
var from_account_id;
var to_account_id;
var from_account_name;
var to_account_name;
var chatHub;
var connectionId;
var imageSourceOptions = {
    'title': 'Select a photo source',
    'buttonLabels': ['Album', 'Camera'],
    'androidEnableCancelButton': true, // default false
    'winphoneEnableCancelButton': true, // default false
    'addCancelButtonWithLabel': 'Cancel'
};

$(document).on("pagehide", "#pageChat", function (event, ui) {
    chatHub.connection.stop();
});

function pageChat_getMessage(messageContent, messageType) {
    var message = {};
    message.FromAccountName = from_account_name;
    message.ToAccountName = to_account_name;
    message.MessageType = messageType;
    message.MessageContent = messageContent;

    return message;
}

function sendPrivateMessage(messageContent, messageType) {
    var message = pageChat_getMessage(messageContent, messageType);
    chatHub.server.sendPrivateMessage(to_account_id, JSON.stringify(message));
}

var receivedMessage = { MessageContent: "", MessageType: 0 };

function registerClientListenerMethods(chatHub) {
    // Calls when user successfully connected
    chatHub.client.onConnected = function (id, userId) {
        connectionId = id;
    }

    chatHub.client.receivePrivateMessage = function (connectionId, fromUserId, message) {
        var jsonMessage = JSON.parse(message);
        appendMessage(from_account_id, jsonMessage);
        if (jsonMessage.MessageType == messageTypeEnum.Photo) {
            setTimeout(function () {
                imageLazyload("#pageChat_messageListWrapper", function () {
                    pageChat_messageListScrollerRefresh();
                });
            }, 500);
        } else {
            pageChat_messageListScrollerRefresh();
        }
    }

    chatHub.client.sendPrivateMessage = function (toUserId, message) {
        if (pageChat_messageListEmpty) {
            $("#chat_container").empty();
        }

        var jsonMessage = JSON.parse(message);
        appendMessage(from_account_id, {
            FromAccountId: from_account_id,
            MessageContent: jsonMessage.MessageContent,
            MessageType: jsonMessage.MessageType,
            Time: jsonMessage.Time
        });

        if (jsonMessage.MessageType == messageTypeEnum.Photo) {
            setTimeout(function () {
                imageLazyload("#pageChat_messageListWrapper", function () {
                    pageChat_messageListScrollerRefresh();
                });
            }, 500);
        } else {
            pageChat_messageListScrollerRefresh();
        }
    }
}

function prependMessage(fromAccountId, message) {
    addMessage(fromAccountId, message, false);
}

function appendMessage(fromAccountId, message) {
    addMessage(fromAccountId, message, true);
}

function addMessage(fromAccountId, message, isAppendAfter) {
    if (message.FromAccountId == fromAccountId) {
        var rightElement = $('<div><div class="pageChat-time-right" id="pageChat_time">' +
                            '</div>' +
                            '<div style="clear:both;"></div>' +
                            '<div class="triangle-right" id="pageChat_triangle_right">' +
                            '</div>' +
                            '<div style="clear:both;"></div></div>');
        if (message.MessageType == messageTypeEnum.Text) {
            rightElement.find("#pageChat_triangle_right").html(message.MessageContent)
                .end().find("#pageChat_time").html(message.Time);
        } else if (message.MessageType == messageTypeEnum.Video) {
            if (window.deviceReady) {
                rightElement.find("#pageChat_triangle_right").removeClass("triangle-right").addClass("triangle-right-vedio")
                .html("<img class=\"audioPlay\" src=\"Images\\play.png\"\ style=\"width:30px;\" data-audio-url=\"" + message.MessageContent + "\">")
                .end().find("#pageChat_time").html(message.Time);
            } else {
                rightElement.find("#pageChat_triangle_right").removeClass("triangle-right").addClass("triangle-right-vedio")
                .html("<audio controls=\"true\"><source src=\"" + message.MessageContent + "\" type=\"audio/mpeg\" /></audio>")
                .end().find("#pageChat_time").html(message.Time);
            }
        } else {
            rightElement.find("#pageChat_triangle_right").removeClass("triangle-right").addClass("triangle-right-img").html("<img class=\"lazy\" data-original=\"" + message.MessageContent + "\" src=\"Images\\ajaxLoading.gif\"\>")
                .end().find("#pageChat_time").html(message.Time);
        }

        if (isAppendAfter) {
            $("#chat_container").append(rightElement);
        } else {
            $("#chat_container").prepend(rightElement);
        }
    } else {
        var leftElement = $('<div><div class="pageChat-time-left" id="pageChat_time">' +
                            '</div>' +
                            '<div style="clear:both;"></div>' +
                            '<div class="triangle-left" id="pageChat_triangle_left">' +
                            '</div>' +
                            '<div style="clear:both;"></div></div>');
        if (message.MessageType == messageTypeEnum.Text) {
            leftElement.find("#pageChat_triangle_left").html(message.MessageContent)
                .end().find("#pageChat_time").html(message.Time);
        } else if (message.MessageType == messageTypeEnum.Video) {
            if (window.deviceReady) {
                leftElement.find("#pageChat_triangle_left").removeClass("triangle-left").addClass("triangle-left-vedio")
                    .html("<img class=\"audioPlay\" src=\"Images\\play.png\"\ style=\"width:30px;\" data-audio-url=\"" + message.MessageContent + "\">")
                    .end().find("#pageChat_time").html(message.Time);
            } else {
                leftElement.find("#pageChat_triangle_left").removeClass("triangle-left").addClass("triangle-left-vedio")
                    .html("<audio controls=\"true\"><source src=\"" + message.MessageContent + "\" type=\"audio/mpeg\" /></audio>")
                    .end().find("#pageChat_time").html(message.Time);
            }
        } else {
            leftElement.find("#pageChat_triangle_left").removeClass("triangle-left").addClass("triangle-left-img").html("<img class=\"lazy\" data-original=\"" + message.MessageContent + "\" src=\"Images\\ajaxLoading.gif\"\>")
                .end().find("#pageChat_time").html(message.Time);
        }
        if (isAppendAfter) {
            $("#chat_container").append(leftElement);
        } else {
            $("#chat_container").prepend(leftElement);
        }
    }
}

var pageChat_messageListScroller;
var pageChat_timestamp;
var pageChat_isEnd;
var pageChat_messageListEmpty = false;

function pageChat_messageListScrollerRefresh() {
    if (pageChat_messageListScroller) {
        pageChat_messageListScroller.refresh();
        if ($("#chat_container > div").length) {
            scrollerToBottom(pageChat_messageListScroller, $("#chat_container > div:last")[0]);
        }
    }
}

$(document).on("pageinit", "#pageChat", function (event, ui) {
    var selfPage = $(this);
    pageChat_timestamp = "";
    pageChat_isEnd = "";
    pageChat_messageListScroller = null;
    pageChat_messageListEmpty = false
    to_account_id = getUrlParam(event.target.baseURI, "accountId");
    pageChat_messageType = getUrlParam(event.target.baseURI, "messageType");
    from_account_id = getCurrentAccountId();
    to_account_name = getUrlParam(event.target.baseURI, "accountName");
    from_account_name = getCustomerName(localStorage.getItem("c_firstName"), localStorage.getItem("c_lastName"));
    $("#pageChat_title").html(to_account_name);

    selfPage.on("focus", "#pageChat_message", function () {
        $("#pageChat_footer").addClass("pageChat_footer");
        $("pageChat_message").val($("pageChat_message").val());
    })
    selfPage.on("blur", "#pageChat_message", function () {
        $("#pageChat_footer").removeClass("pageChat_footer");
    })

    selfPage.on("click", ".triangle-right-vedio,.triangle-left-vedio", function () {
        var self = $(this);
        var selfImage = self.find(".audioPlay");
        var audioUrl = selfImage.data("audio-url");

        var media = new Media(audioUrl,
        // success callback
        function () {
        },
        // error callback
        function (err) {
        },
        // status change callback
        function (mediaStatus) {
            if (mediaStatus == 4) {
                selfImage.attr("src", "Images/play.png");
                media.release();
            }
        });

        if (self.hasClass("triangle-right-vedio")) {
            selfImage.attr("src", "Images/playing-right.gif");
        } else {
            selfImage.attr("src", "Images/playing-left.gif");
        }

        media.play();
    })

    initChatAction(pageChat_messageType);

    Ajax.getJson("GetMessageByFromAccountId", { toAccountId: to_account_id, fromAccountId: from_account_id, timestamp: pageChat_timestamp, pageNumber: pageNumber }, function (data) {
        if (data.IsSuccess) {
            if (data.Data.Source.length) {
                //for (var i = data.Data.Source.length - 1 ; i >= 0 ; i--) {
                for (var i = 0 ; i < data.Data.Source.length ; i++) {
                    var message = data.Data.Source[i];
                    prependMessage(from_account_id, message);
                }

                pageChat_timestamp = data.Data.Timestamp;
            } else {
                $("#chat_container").html(noMessageItemHtml);
                pageChat_messageListEmpty = true;
            }

            Ajax.getJson("UpdateMessageStatusToRead", { toAccountId: from_account_id, fromAccountId: to_account_id });
        }

        pageChat_messageListScroller = listScroller.createInstance('pageChat_messageListWrapper', function () {
            if (data.Data.Source.length == pageNumber) {
                pageChat_messageCallback();
            }
        });

        pageChat_messageListScrollerRefresh();
        setTimeout(function () {
            imageLazyload("#pageChat_messageListWrapper", function () {
                if (pageChat_messageListScroller)
                    pageChat_messageListScroller.refresh();
            });
        }, 500);

        //$('audio').audioPlayer();
    })

    function pageChat_messageCallback() {
        if (!pageChat_isEnd) {
            Ajax.getJson("GetMessageByFromAccountId", { toAccountId: to_account_id, fromAccountId: from_account_id, timestamp: pageChat_timestamp, pageNumber: pageNumber }, function (data) {
                if (data.IsSuccess) {
                    if (data.Data.Source.length < pageNumber) {
                        pageChat_isEnd = true;
                    }

                    if (data.Data.Source.length) {
                        for (var i = 0 ; i < data.Data.Source.length ; i++) {
                            var message = data.Data.Source[i];
                            prependMessage(from_account_id, message);
                        }

                        pageChat_timestamp = data.Data.Timestamp;
                    }

                    if (pageChat_messageListScroller)
                        pageChat_messageListScroller.refresh();

                    setTimeout(function () {
                        imageLazyload("#pageChat_messageListWrapper", function () {
                            if (pageChat_messageListScroller)
                                pageChat_messageListScroller.refresh();
                        });
                    }, 500);
                }
            })
        }
    }

    // Declare a proxy to reference the hub.
    $.connection.hub.url = Config.chatHubRootPath + "signalr";
    chatHub = $.connection.chatHub;
    registerClientListenerMethods(chatHub);
    // Start Hub
    $.connection.hub.start().done(function () {
        chatHub.server.connect(from_account_id);
    });

    selfPage.on("click", "#pageChat_btnSendText", function () {
        var messageContent = $.trim($("#pageChat_message").val());
        if (messageContent.length > 0) {
            var messageType = messageTypeEnum.Text;
            sendPrivateMessage(messageContent, messageType);
            $("#pageChat_message").val("");
            $("#popupChatAction").hide();
        }
    });

    selfPage.on("click", "#pageChat_btnSendPhoto", function () {
        selectLocalImage();
    });

    selfPage.on("click", "#pageChat_btnSendVedio", function () {
        captureAudio();
    });

    selfPage.on("click", "#pageChat_footer #chatAction", function () {
        var self = $(this);
        var offset = self.find("a").offset();
        $("#popupChatAction").css("top", offset.top - $("#popupChatAction").height() - 5)
            .css("left", offset.left)
            .show();
        //$("#popupChatAction").animate({ "top": ($("#chatAction").offset().top - $("#popupChatAction").height()) + "px" });
    });

    selfPage.on("click", "#popupChatAction a", function () {
        var messageType = $(this).data("message-type");
        initChatAction(messageType);
        $("#popupChatAction").hide();
    });
});

function initChatAction(messageType) {
    if (messageType == messageTypeEnum.Text) {
        $("#pageChat_footer").html($("#pageChat_TextTemplate").html());
        $("#pageChat_footer #pageChat_message").autosize().height(40);
        $("#pageChat_footer").css("height", "auto");
        $("#pageChat_messageListWrapper").css("bottom", "55px");
    } else if (messageType == messageTypeEnum.Video) {
        $("#pageChat_footer").html($("#pageChat_VedioTemplate").html());
        $("#pageChat_messageListWrapper").css("bottom", "50px");
    } else {
        $("#pageChat_footer").html($("#pageChat_PhotoTemplate").html());
        $("#pageChat_messageListWrapper").css("bottom", "50px");
    }

    if (pageChat_messageListScroller)
        pageChat_messageListScroller.refresh();
}

function captureAudio() {
    if (window.deviceReady) {
        navigator.device.capture.captureAudio(captureAudioSuccess, captureAudioError, { limit: 1 });
    }
}

function captureAudioSuccess(mediaFiles) {
    var audioUrl = mediaFiles[0].fullPath;
    var audioName = mediaFiles[0].name;
    Messagebox.confirm("Are you sure send a audio", function (buttonIndex) {
        if (buttonIndex == 2) {
            uploadAudioClickEvent(audioUrl, audioName);
        }
    }, "Send a audio", ['Cancel', 'Send']);
}

function captureAudioError(mediaFiles) {
    messageBox.popup("Capture audio error");
}

function selectLocalImage() {
    if (window.deviceReady) {
        window.plugins.actionsheet.show(imageSourceOptions, function (buttonIndex) {
            switch (buttonIndex) {
                case 1:
                case 2:
                    var getType = navigator.camera.PictureSourceType.SAVEDPHOTOALBUM;
                    if (buttonIndex == 2) {
                        getType = navigator.camera.PictureSourceType.CAMERA;
                    }
                    getPhoto(getType, function (imageURI) {
                        Messagebox.confirm("Are you sure send a picture", function (buttonIndex) {
                            if (buttonIndex == 2) {
                                uploadImageClickEvent(imageURI);
                            }
                        }, "Send a picture", ['Cancel', 'Send']);
                    }, function () { });
                    break;
            }
        });
    }
}

function uploadImageClickEvent(imageUrl) {
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
    params.purpose = "message";
    options.params = params;

    var ft = new FileTransfer();
    ft.upload(imageUrl, Config.chatHubRootPath + "UploadFile/Post", function (res) {
        Messagebox.hideLoading();
        var data = JSON.parse(res.response.replace("(", "").replace(")", ""));
        if (data.IsSuccess) {
            var messageContent = data.Data.Url;
            sendPrivateMessage(messageContent, messageTypeEnum.Photo);
            //appendMessage(from_account_id, {
            //    FromAccountId: from_account_id,
            //    MessageContent: messageContent,
            //    MessageType: messageType,
            //    Time: (new Date()).format("yyyy-MM-dd hh:mm")
            //});
            //pageChat_messageListScrollerRefresh();
            $("#popupChatAction").hide();
        } else {
            Messagebox.popup(data.Message);
        }
    }, function (res) {
        Messagebox.hideLoading();
        Messagebox.popup("Error");
    }, options);
}

function uploadAudioClickEvent(audioUrl, audioName) {
    Messagebox.showLoading();
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = audioName + ".mp3";
    //options.fileName = audioUrl.substr(audioUrl.lastIndexOf('/') + 1);
    options.mimeType = "audio/mpeg";
    options.chunkedMode = false;

    var params = {};
    params.purpose = "message";
    options.params = params;

    var ft = new FileTransfer();
    ft.upload(audioUrl, Config.chatHubRootPath + "UploadFile/Post", function (res) {
        Messagebox.hideLoading();
        var data = JSON.parse(res.response.replace("(", "").replace(")", ""));
        if (data.IsSuccess) {
            var messageContent = data.Data.Url;
            sendPrivateMessage(messageContent, messageTypeEnum.Video);
            $("#popupChatAction").hide();
        } else {
            Messagebox.popup(data.Message);
        }
    }, function (res) {
        Messagebox.hideLoading();
        Messagebox.popup("Error");
    }, options);
}
