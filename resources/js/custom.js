
/**
 *-------------------------------------------------------------
 * Global variables
 *-------------------------------------------------------------
 */

import axios from 'axios';
import {MessageQueue} from './MessageQueue';
const queue = new MessageQueue;

const pathName = window.location.pathname;

if (!pathName.includes('register') && !pathName.includes('settings') && !pathName.includes('step-two')) {
    let messenger,
        typingTimeout,
        typingNow = 0,
        temporaryMsgId = 0,
        defaultAvatarInSettings = null,
        messengerColor,
        dark_mode,
        messages_page = 1;
    //sendPic = 0;

    const messagesContainer = $(".messenger-messagingView .m-body"),
        messageInnerContainer = $(".messages"),
        messengerTitleDefault = $(".messenger-headTitle").text(),
        messageInput = $("#message-form .m-send"),
        auth_id = $("meta[name=url]").attr("data-user"),
        url = $("meta[name=url]").attr("content"),
        defaultMessengerColor = $("meta[name=messenger-color]").attr("content"),
        access_token = $('meta[name="csrf-token"]').attr("content");

    const getMessengerId = () => $("meta[name=id]").attr("content");
    const getMessengerType = () => $("meta[name=type]").attr("content");
    const setMessengerId = (id) => $("meta[name=id]").attr("content", id);
    const setMessengerType = (type) => $("meta[name=type]").
        attr("content", type);

    const setBotTo = (id) => $("meta[name=bot]").attr("data-to", id);
    const setBotFrom = (id) => $("meta[name=bot]").attr("data-from", id);
    const getBotTo = () => $("meta[name=bot]").attr("data-to");
    const getBotFrom = () => $("meta[name=bot]").attr("data-from");

    const setAuthId = (id) => $("meta[name=url]").attr("data-user", id);
    var botTyping = false;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let addChatUser = urlParams.get('add_chat_user');
    const modelName = urlParams.get('modelName');
    const dateTimeSplit = urlParams.get('dateTime')?.split('_');
    const date = dateTimeSplit?.[0].replace("-", " ");
    const time = dateTimeSplit?.[1];
    const city = urlParams.get('city')?.replace("_", " ");

    /**
     *-------------------------------------------------------------
     * Re-usable methods
     *-------------------------------------------------------------
     */
    const escapeHtml = (unsafe) => {
        return unsafe.replace(/&/g, "&amp;").
            replace(/</g, "&lt;").
            replace(/>/g, "&gt;");
    };

    function actionOnScroll(selector, callback, topScroll = false) {
        $(selector).on("scroll", function() {
            let element = $(this).get(0);
            const condition = topScroll
                ?
                element.scrollTop == 0
                :
                element.scrollTop + element.clientHeight >=
                element.scrollHeight;
            if (condition) {
                callback();
            }
        });
    }

    function routerPush(title, url) {
        $("meta[name=url]").attr("content", url);
        return window.history.pushState({}, title || document.title, url);
    }

    function updateSelectedContact(user_id) {
        $(document).find(".messenger-list-item").removeClass("m-list-active");
        $(document).find(
            ".messenger-list-item[data-contact=" +
            (user_id || getMessengerId()) + "]"
        ).addClass("m-list-active");
    }

    function makeLinksClickable() {
        const messageCards = document.querySelectorAll('.message-card p');
        const subs = document.querySelectorAll('.message-card p sub');

        messageCards.forEach((card, index) => {
            const text = card.innerText;
            if (text.includes('http')) {
                const firstString = text.split("http");
                const myLink = firstString[1].split(' ');
                const secondString = firstString[1].slice(
                    firstString[1].indexOf(' ') + 1);

                /*const number = secondString.match(/\d+/);*/
                const secondSplit = secondString.split(/\d+/);

                card.innerHTML = firstString[0] +
                    ' <a target="_blank" href="http' + myLink[0] + '">' +
                    "http" + myLink[0] + '</a> ' + secondSplit[0] /*+ ' <sub>' + number[0] + ' ' + secondSplit[1] + '</sub>'*/;

            }
        })
    }

    /**
     *-------------------------------------------------------------
     * Global Templates
     *-------------------------------------------------------------
     */
// Loading svg
    function loadingSVG(w_h = "25px", className = "", style = "") {
        return `
<svg style="${style}" class="loadingSVG ${className}" xmlns="http://www.w3.org/2000/svg" width="${w_h}" height="${w_h}" viewBox="0 0 40 40" stroke="${defaultMessengerColor}">
<g fill="none" fill-rule="evenodd">
<g transform="translate(2 2)" stroke-width="3">
<circle stroke-opacity=".1" cx="18" cy="18" r="18"></circle>
<path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(349.311 18 18)">
    <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur=".8s" repeatCount="indefinite"></animateTransform>
</path>
</g>
</g>
</svg>
`;
    }

    function loadingWithContainer(className) {
        return `<div class="${className}" style="text-align:center;padding:15px">${loadingSVG(
            "25px",
            "",
            "margin:auto"
        )}</div>`;
    }

// loading placeholder for users list item
    function listItemLoading(items) {
        let template = "";
        for (let i = 0; i < items; i++) {
            template += `
            <div class="loadingPlaceholder">
                <div class="loadingPlaceholder-wrapper">
                  <div class="loadingPlaceholder-body">
                      <table class="loadingPlaceholder-header">
                        <tr>
                          <td style="width: 45px;">
                            <div class="loadingPlaceholder-avatar"></div>
                          </td>
                          <td>
                            <div class="loadingPlaceholder-name"></div>
                            <div class="loadingPlaceholder-date"></div>
                          </td>
                        </tr>
                      </table>
                  </div>
                </div>
            </div>
        `;
        }
        return template;
    }

// loading placeholder for avatars
    function avatarLoading(items) {
        let template = "";
        for (let i = 0; i < items; i++) {
            template += `
<div class="loadingPlaceholder">
<div class="loadingPlaceholder-wrapper">
  <div class="loadingPlaceholder-body">
      <table class="loadingPlaceholder-header">
          <tr>
              <td style="width: 45px;">
                  <div class="loadingPlaceholder-avatar" style="margin: 2px;"></div>
              </td>
          </tr>
      </table>
  </div>
</div>
</div>
`;
        }
        return template;
    }

// While sending a message, show this temporary message card.
    function sendigCard(message, id) {

        let classes;
        if (botTyping) {
            classes = "message-card"
        } else {
            classes = "message-card mc-sender";
        }

        return (
            `
<div class="` + classes + `" data-id="` +
            id +
            `">
<p>` +
            message +
            `<sub><span class="far fa-clock"></span></sub></p>
</div>
`
        );

    }

// upload image preview card.
    function attachmentTemplate(fileType, fileName, imgURL = null) {
        if (fileType !== "image") {
            return (
                `
<div class="attachment-preview">
  <span class="fas fa-times cancel"></span>
  <p style="padding:0px 30px;"><span class="fas fa-file"></span> ` +
                escapeHtml(fileName) +
                `</p>
</div>
`
            );
        } else {
            return (
                `
<div class="attachment-preview">
  <span class="fas fa-times cancel"></span>
  <div class="image-file chat-image" style="background-image: url('` +
                imgURL +
                `');"></div>
  <p><span class="fas fa-file-image"></span> ` +
                escapeHtml(fileName) +
                `</p>
</div>
`
            );
        }
    }

// Active Status Circle
    function activeStatusCircle() {
        return `<span class="activeStatus"></span>`;
    }

    /**
     *-------------------------------------------------------------
     * Css Media Queries [For responsive design]
     *-------------------------------------------------------------
     */
    $(window).resize(function() {
        cssMediaQueries();
    });

    function cssMediaQueries() {
        if (window.matchMedia("(min-width: 980px)").matches) {
            $(".messenger-listView").removeAttr("style");
        }
        if (window.matchMedia("(max-width: 980px)").matches) {
            $("body").
                find(".messenger-list-item").
                find("tr[data-action]").
                attr("data-action", "1");
            $("body").
                find(".favorite-list-item").
                find("div").
                attr("data-action", "1");
        } else {
            $("body").
                find(".messenger-list-item").
                find("tr[data-action]").
                attr("data-action", "0");
            $("body").
                find(".favorite-list-item").
                find("div").
                attr("data-action", "0");
        }
    }

    /**
     *-------------------------------------------------------------
     * App Modal
     *-------------------------------------------------------------
     */
    let app_modal = function({
                                 show = true,
                                 name,
                                 data = 0,
                                 buttons = true,
                                 header = null,
                                 body = null,
                             }) {
        const modal = $(".app-modal[data-name=" + name + "]");
        // header
        header ? modal.find(".app-modal-header").html(header) : "";

        // body
        body ? modal.find(".app-modal-body").html(body) : "";

        // buttons
        buttons == true
            ? modal.find(".app-modal-footer").show()
            : modal.find(".app-modal-footer").hide();

        // show / hide
        if (show == true) {
            modal.show();
            $(".app-modal-card[data-name=" + name + "]").
                addClass("app-show-modal");
            $(".app-modal-card[data-name=" + name + "]").
                attr("data-modal", data);
        } else {
            modal.hide();
            $(".app-modal-card[data-name=" + name + "]").
                removeClass("app-show-modal");
            $(".app-modal-card[data-name=" + name + "]").
                attr("data-modal", data);
        }
    };

    /**
     *-------------------------------------------------------------
     * Slide to bottom on [action] - e.g. [message received, sent, loaded]
     *-------------------------------------------------------------
     */
    function scrollBottom(container) {
        $(container).stop().animate({
            scrollTop: $(container)[0].scrollHeight,
        });
    }

    /**
     *-------------------------------------------------------------
     * click and drag to scroll - function
     *-------------------------------------------------------------
     */
    function hScroller(scroller) {
        const slider = document.querySelector(scroller);
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener("mouseleave", () => {
            isDown = false;
        });
        slider.addEventListener("mouseup", () => {
            isDown = false;
        });
        slider.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1;
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    /**
     *-------------------------------------------------------------
     * Disable/enable message form fields, messaging container...
     * on load info or if needed elsewhere.
     *
     * Default : true
     *-------------------------------------------------------------
     */
    function disableOnLoad(action = true) {
        if (action == true) {
            // hide star button
            $(".add-to-favorite").hide();
            // hide send card
            $(".messenger-sendCard").hide();
            // add loading opacity to messages container
            messagesContainer.css("opacity", ".5");
            // disable message form fields
            messageInput.attr("readonly", "readonly");
            $("#message-form button").attr("disabled", "disabled");
            $(".upload-attachment").attr("disabled", "disabled");
        } else {
            // show star button
            if (getMessengerId() != auth_id) {
                $(".add-to-favorite").show();
            }
            // show send card
            $(".messenger-sendCard").show();
            // remove loading opacity to messages container
            messagesContainer.css("opacity", "1");
            // enable message form fields
            messageInput.removeAttr("readonly");
            $("#message-form button").removeAttr("disabled");
            $(".upload-attachment").removeAttr("disabled");
        }
    }

    /**
     *-------------------------------------------------------------
     * Error message card
     *-------------------------------------------------------------
     */
    function errorMessageCard(id) {
        messagesContainer.find(".message-card[data-id=" + id + "]").
            addClass("mc-error");
        messagesContainer.find(".message-card[data-id=" + id + "]").
            find("svg.loadingSVG").
            remove();
        messagesContainer.find(".message-card[data-id=" + id + "] p").
            prepend('<span class="fas fa-exclamation-triangle"></span>');
    }

    /**
     *-------------------------------------------------------------
     * Fetch id data (user/group) and update the view
     *-------------------------------------------------------------
     */
    function IDinfo(id, type) {
        // clear temporary message id
        temporaryMsgId = 0;
        // clear typing now
        typingNow = 0;
        // show loading bar
        NProgress.start();
        // disable message form
        disableOnLoad();
        if (messenger != 0) {
            // get shared photos
            getSharedPhotos(id);
            // Get info
            $.ajax({
                url: url + "/idInfo",
                method: "POST",
                data: {_token: access_token, id, type},
                dataType: "JSON",
                success: (data) => {
                    // avatar photo
                    $(".messenger-infoView").
                        find(".avatar").
                        css("background-image",
                            'url("' + data.user_avatar + '")');
                    $(".header-avatar").css(
                        "background-image",
                        'url("' + data.user_avatar + '")'
                    );
                    // Show shared and actions
                    $(".messenger-infoView-btns .delete-conversation").show();
                    $(".messenger-infoView-shared").show();
                    // fetch messages
                    fetchMessages(id, type, true);
                    // focus on messaging input
                    messageInput.focus();
                    // update info in view
                    $(".messenger-infoView .info-name").html(data.fetch.name);
                    $(".m-header-messaging .user-name").html(data.fetch.name);
                    // Star status
                    data.favorite > 0
                        ? $(".add-to-favorite").addClass("favorite")
                        : $(".add-to-favorite").removeClass("favorite");
                    // form reset and focus
                    $("#message-form").trigger("reset");
                    cancelAttachment();
                    messageInput.focus();
                },
                error: () => {
                    console.error("Error, check server response!");
                    // remove loading bar
                    NProgress.done();
                    NProgress.remove();
                },
            });
        } else {
            // remove loading bar
            NProgress.done();
            NProgress.remove();
        }
    }

    /**
     *-------------------------------------------------------------
     * Send message function
     *-------------------------------------------------------------
     */
    function sendMessage(sendTo = null, fromID = "false", sendPic = 0, picNumber = null) {
        temporaryMsgId += 1;
        let tempID = "temp_" + temporaryMsgId;
        let hasFile = $(".upload-attachment").val() ? true : false;

        let sendToUser = sendTo ? sendTo : getMessengerId();

        if ($.trim(messageInput.val()).length > 0 || hasFile || addChatUser ||
            sendPic) {

            const formData = new FormData($("#message-form")[0]);
            formData.append("id", sendToUser);
            formData.append("type", getMessengerType());
            formData.append("temporaryMsgId", tempID);
            formData.append("from", fromID);
            formData.append("_token", access_token);
            formData.append("sendPic", sendPic);
            formData.append("picNumber", picNumber);

            $.ajax({
                url: $("#message-form").attr("action"),
                method: "POST",
                data: formData,
                dataType: "JSON",
                processData: false,
                contentType: false,
                beforeSend: () => {
                    // remove message hint
                    $(".messages").find(".message-hint").remove();

                    // append message
                    hasFile
                        ? messagesContainer.find(".messages").append(
                            sendigCard(
                                messageInput.val() + "\n" + loadingSVG("28px"),
                                tempID
                            ))
                        :
                        messagesContainer.find(".messages").
                            append(sendigCard(messageInput.val(), tempID));
                    // scroll to bottom
                    scrollBottom(messageInnerContainer);
                    messageInput.css({height: "42px"});
                    // form reset and focus
                    $("#message-form").trigger("reset");
                    cancelAttachment();
                    messageInput.focus();
                },
                success: (data) => {

                    if (data.error > 0) {
                        // message card error status
                        errorMessageCard(tempID);
                        console.error(data.error);
                    } else {
                        // update contact item
                        updateContatctItem(sendToUser);

                        messagesContainer.find('.mc-sender[data-id="sending"]').
                            remove();

                        // get message before the sending one [temporary]
                        messagesContainer.find(
                            ".message-card[data-id=" + data.tempID + "]").
                            before(data.message);
                        // delete the temporary one
                        messagesContainer.find(
                            ".message-card[data-id=" + data.tempID + "]").
                            remove();

                        if (sendTo) {
                            document.querySelector(
                                '[data-id="' + data.messageID + '"]').remove();
                            if (sendPic) {
                                document.querySelector(
                                    '[data-id="' + data.messageID + '"]').
                                    nextElementSibling.
                                    remove();
                            }
                        }

                        // scroll to bottom
                        scrollBottom(messageInnerContainer);
                        // send contact item updates
                        sendContactItemUpdates(true);

                        setTimeout(() => {
                            makeLinksClickable();
                        }, 500)

                        if (sendTo === null && botTyping) {

                            queue.enqueue(data.message);
                            //console.log(queue);

                        } else {
                            checkForAgentResponse(data.message);
                        }
                    }
                },
                error: () => {
                    // message card error status
                    errorMessageCard(tempID);
                    // error log
                    console.error(
                        "Failed sending the message! Please, check your server response"
                    );
                },
            });
        }

        return false;
    }

    /**
     *-------------------------------------------------------------
     * Fetch messages from database
     *-------------------------------------------------------------
     */
    let messagesPage = 1;
    let noMoreMessages = false;
    let messagesLoading = false;

    function setMessagesLoading(loading = false) {
        if (!loading) {
            messagesContainer.find(".messages").
                find(".loading-messages").
                remove();
            NProgress.done();
            NProgress.remove();
        } else {
            messagesContainer.find(".messages").
                prepend(loadingWithContainer("loading-messages"));
        }
        messagesLoading = loading;
    }

    function fetchMessages(id, type, newFetch = false) {
        if (newFetch) {
            messagesPage = 1;
            noMoreMessages = false;
        }
        if (messenger != 0 && !noMoreMessages && !messagesLoading) {
            const messagesElement = messagesContainer.find(".messages");
            setMessagesLoading(true);
            $.ajax({
                url: url + "/fetchMessages",
                method: "POST",
                data: {
                    _token: access_token,
                    id: id,
                    type: type,
                    page: messagesPage,
                },
                dataType: "JSON",
                success: (data) => {
                    setMessagesLoading(false);
                    if (messagesPage == 1) {
                        messagesElement.html(data.messages);
                        scrollBottom(messageInnerContainer);
                    } else {
                        const lastMsg = messagesElement.find(
                            messagesElement.find(".message-card")[0]
                        );
                        const curOffset =
                            lastMsg.offset().top -
                            messagesContainer.scrollTop();
                        messagesElement.prepend(data.messages);
                        messagesContainer.scrollTop(
                            lastMsg.offset().top - curOffset);
                    }
                    // trigger seen event
                    makeSeen(true);
                    // Pagination lock & messages page
                    noMoreMessages = messagesPage >= data?.last_page;
                    if (!noMoreMessages) messagesPage += 1;
                    // Enable message form if messenger not = 0; means if data is valid
                    if (messenger != 0) {
                        disableOnLoad(false);
                    }

                    makeLinksClickable();
                },
                error: (error) => {
                    setMessagesLoading(false);
                    console.error(error);
                },
            });
        }
    }

    /**
     *-------------------------------------------------------------
     * Cancel file attached in the message.
     *-------------------------------------------------------------
     */
    function cancelAttachment() {
        $(".messenger-sendCard").find(".attachment-preview").remove();
        $(".upload-attachment").replaceWith(
            $(".upload-attachment").val("").clone(true)
        );
    }

    /**
     *-------------------------------------------------------------
     * Cancel updating avatar in settings
     *-------------------------------------------------------------
     */
    function cancelUpdatingAvatar() {
        $(".upload-avatar-preview").
            css("background-image", defaultAvatarInSettings);
        $(".upload-avatar").
            replaceWith($(".upload-avatar").val("").clone(true));
    }

    /**
     *-------------------------------------------------------------
     * Pusher channels and event listening..
     *-------------------------------------------------------------
     */

// subscribe to the channel

    var channel = pusher.subscribe("private-chatify");

    // Listen to messages, and append if data received
    channel.bind("messaging", function(data) {

        if (data.from_id == getMessengerId() && data.to_id == auth_id) {
            $(".messages").find(".message-hint").remove();
            messagesContainer.find(".messages").append(data.message);
            scrollBottom(messageInnerContainer);
            makeSeen(true);
            // remove unseen counter for the user from the contacts list
            $(".messenger-list-item[data-contact=" + getMessengerId() +
                "]").
                find("tr>td>b").
                remove();
        }

        setBotTo(data.from_id);
        setBotFrom(data.to_id);
        //const message = data.message
        //const toID = data.to_id;

    });

    // listen to typing indicator
    channel.bind("client-typing", function(data) {
        if (data.from_id == getMessengerId() && data.to_id == auth_id) {
            data.typing == true
                ? messagesContainer.find(".typing-indicator").show()
                : messagesContainer.find(".typing-indicator").hide();
        }
        // scroll to bottom
        scrollBottom(messageInnerContainer);
    });

    // listen to seen event
    channel.bind("client-seen", function(data) {
        if (data.from_id == getMessengerId() && data.to_id == auth_id) {
            if (data.seen == true) {
                $(".message-time").
                    find(".fa-check").
                    before(
                        '<span class="fas fa-check-double seen"></span> ');
                $(".message-time").find(".fa-check").remove();
                console.info("[seen] triggered!");
            } else {
                console.error("[seen] event not triggered!");
            }
        }
    });

    // listen to contact item updates event
    channel.bind("client-contactItem", function(data) {
        if (data.update_for == auth_id) {
            data.updating == true
                ? updateContatctItem(data.update_to)
                : console.error("[Contact Item updates] Updating failed!");
        }
    });

    // -------------------------------------
    // presence channel [User Active Status]
    var activeStatusChannel = pusher.subscribe("presence-activeStatus");

    // Joined
    activeStatusChannel.bind("pusher:member_added", function(member) {
        setActiveStatus(1, member.id);
        $(".messenger-list-item[data-contact=" + member.id + "]").
            find(".activeStatus").
            remove();
        $(".messenger-list-item[data-contact=" + member.id + "]").
            find(".avatar").
            before(activeStatusCircle());
    });

    // Leaved
    activeStatusChannel.bind("pusher:member_removed", function(member) {
        setActiveStatus(0, member.id);
        $(".messenger-list-item[data-contact=" + member.id + "]").
            find(".activeStatus").
            remove();
    });


    /**
     *-------------------------------------------------------------
     * Trigger typing event
     *-------------------------------------------------------------
     */
    function isTyping(status) {

        return channel.trigger("client-typing", {
            from_id: botTyping ? getMessengerId() : auth_id, // Me
            to_id: botTyping ? auth_id : getMessengerId(), // Messenger
            typing: status,
        });
    }

    /**
     *-------------------------------------------------------------
     * Trigger seen event
     *-------------------------------------------------------------
     */
    function makeSeen(status) {
        // remove unseen counter for the user from the contacts list
        $(".messenger-list-item[data-contact=" + getMessengerId() + "]").
            find("tr>td>b").
            remove();

        // seen
        $.ajax({
            url: url + "/makeSeen",
            method: "POST",
            data: {_token: access_token, id: getMessengerId()},
            dataType: "JSON",
            /*success: data => {
                 console.log("[seen] Messages seen - " + getMessengerId());
            }*/
        });
        return channel.trigger("client-seen", {
            from_id: auth_id, // Me
            to_id: getMessengerId(), // Messenger
            seen: status,
        });
    }

    /**
     *-------------------------------------------------------------
     * Trigger contact item updates
     *-------------------------------------------------------------
     */
    function sendContactItemUpdates(status) {
        return channel.trigger("client-contactItem", {
            update_for: getMessengerId(), // Messenger
            update_to: auth_id, // Me
            updating: status,
        });
    }

    /**
     *-------------------------------------------------------------
     * Check internet connection using pusher states
     *-------------------------------------------------------------
     */
    function checkInternet(state, selector) {
        let net_errs = 0;
        const messengerTitle = $(".messenger-headTitle");
        switch (state) {
            case "connected":
                if (net_errs < 1) {
                    messengerTitle.text(messengerTitleDefault);
                    selector.addClass("successBG-rgba");
                    selector.find("span").hide();
                    selector.slideDown("fast", function() {
                        selector.find(".ic-connected").show();
                    });
                    setTimeout(function() {
                        $(".internet-connection").slideUp("fast");
                    }, 3000);
                }
                break;
            case "connecting":
                messengerTitle.text($(".ic-connecting").text());
                selector.removeClass("successBG-rgba");
                selector.find("span").hide();
                selector.slideDown("fast", function() {
                    selector.find(".ic-connecting").show();
                });
                net_errs = 1;
                break;
            // Not connected
            default:
                messengerTitle.text($(".ic-noInternet").text());
                selector.removeClass("successBG-rgba");
                selector.find("span").hide();
                selector.slideDown("fast", function() {
                    selector.find(".ic-noInternet").show();
                });
                net_errs = 1;
                break;
        }
    }

    /**
     *-------------------------------------------------------------
     * Get contacts
     *-------------------------------------------------------------
     */
    let contactsPage = 1;
    let contactsLoading = false;
    let noMoreContacts = false;

    function setContactsLoading(loading = false) {
        if (!loading) {
            $(".listOfContacts").find(".loading-contacts").remove();
        } else {
            $(".listOfContacts").append(
                `<div class="loading-contacts">${listItemLoading(4)}</div>`
            );
        }
        contactsLoading = loading;
    }

    function getContacts() {
        if (!contactsLoading && !noMoreContacts) {
            setContactsLoading(true);

            const packets = {
                page: contactsPage
            }

            try {
                axios.get(url + "/getContacts", packets).
                    then((data) => {
                        setContactsLoading(false);
                        if (contactsPage < 2) {
                            $(".listOfContacts").html(data.contacts);
                        } else {
                            $(".listOfContacts").append(data.contacts);
                        }
                        updateSelectedContact();
                        // update data-action required with [responsive design]
                        cssMediaQueries();
                        if (data.total > 0) {
                            $('.listOfContacts').css('height', 'auto');
                        }
                        // Pagination lock & messages page
                        noMoreContacts = contactsPage >= data?.last_page;
                        if (!noMoreContacts) contactsPage += 1;
                    })
            } catch (err) {
                setContactsLoading(false);
                console.error(error);
            }

            /*$.ajax({
                url: url + "/getContacts",
                method: "GET",
                data: {_token: access_token, page: contactsPage},
                dataType: "JSON",
                success: (data) => {
                    setContactsLoading(false);
                    if (contactsPage < 2) {
                        $(".listOfContacts").html(data.contacts);
                    } else {
                        $(".listOfContacts").append(data.contacts);
                    }
                    updateSelectedContact();
                    // update data-action required with [responsive design]
                    cssMediaQueries();
                    if (data.total > 0) {
                        $('.listOfContacts').css('height', 'auto');
                    }
                    // Pagination lock & messages page
                    noMoreContacts = contactsPage >= data?.last_page;
                    if (!noMoreContacts) contactsPage += 1;
                },
                error: (error) => {
                    setContactsLoading(false);
                    console.error(error);
                },
            });*/
        }
    }

    /**
     *-------------------------------------------------------------
     * Update contact item
     *-------------------------------------------------------------
     */
    async function updateContatctItem(user_id) {
        if (user_id != auth_id) {
            let listItem = $("body").
                find(".listOfContacts").
                find(".messenger-list-item[data-contact=" + user_id + "]");

            let result;

            try {
                result = await $.ajax({
                    url: url + "/updateContacts",
                    method: "POST",
                    data: {
                        _token: access_token,
                        user_id,
                    },
                    dataType: "JSON",
                });

                listItem.remove();
                $(".listOfContacts").prepend(result.contactItem);
                // update data-action required with [responsive design]
                cssMediaQueries();
                updateSelectedContact(user_id);
            } catch (error) {
                console.error(error);
            }

            /*$.ajax({
                url: url + "/updateContacts",
                method: "POST",
                data: {
                    _token: access_token,
                    user_id,
                },
                dataType: "JSON",
                success: (data) => {
                    console.log(data);
                    listItem.remove();
                    $(".listOfContacts").prepend(data.contactItem);
                    // update data-action required with [responsive design]
                    cssMediaQueries();
                    updateSelectedContact(user_id);
                },
                error: () => {
                    console.error("Server error, check your response");
                },
            });*/
        }
    }

    /**
     *-------------------------------------------------------------
     * Star
     *-------------------------------------------------------------
     */

    function star(user_id) {
        if (getMessengerId() != auth_id) {
            $.ajax({
                url: url + "/star",
                method: "POST",
                data: {_token: access_token, user_id: user_id},
                dataType: "JSON",
                success: (data) => {
                    data.status > 0
                        ? $(".add-to-favorite").addClass("favorite")
                        : $(".add-to-favorite").removeClass("favorite");
                },
                error: () => {
                    console.error("Server error, check your response");
                },
            });
        }
    }

    /**
     *-------------------------------------------------------------
     * Get favorite list
     *-------------------------------------------------------------
     */
    function getFavoritesList() {
        $(".messenger-favorites").html(avatarLoading(4));
        $.ajax({
            url: url + "/favorites",
            method: "POST",
            data: {_token: access_token},
            dataType: "JSON",
            success: (data) => {
                if (data.count > 0) {
                    $(".favorites-section").show();
                    $(".messenger-favorites").html(data.favorites);
                } else {
                    $(".favorites-section").hide();
                }
                // update data-action required with [responsive design]
                cssMediaQueries();
            },
            error: () => {
                console.error("Server error, check your response");
            },
        });
    }

    /**
     *-------------------------------------------------------------
     * Get shared photos
     *-------------------------------------------------------------
     */
    function getSharedPhotos(user_id) {
        $.ajax({
            url: url + "/shared",
            method: "POST",
            data: {_token: access_token, user_id: user_id},
            dataType: "JSON",
            success: (data) => {
                $(".shared-photos-list").html(data.shared);
            },
            error: () => {
                console.error("Server error, check your response");
            },
        });
    }

    /**
     *-------------------------------------------------------------
     * Search in messenger
     *-------------------------------------------------------------
     */
    let searchPage = 1;
    let noMoreDataSearch = false;
    let searchLoading = false;
    let searchTempVal = "";

    function setSearchLoading(loading = false) {
        if (!loading) {
            $(".search-records").find(".loading-search").remove();
        } else {
            $(".search-records").append(
                `<div class="loading-search">${listItemLoading(4)}</div>`
            );
        }
        searchLoading = loading;
    }

    function messengerSearch(input) {
        if (input !== searchTempVal) {
            searchPage = 1;
            noMoreDataSearch = false;
            searchLoading = false;
        }
        searchTempVal = input;
        if (!searchLoading && !noMoreDataSearch) {
            if (searchPage < 2) {
                $(".search-records").html("");
            }
            setSearchLoading(true);
            $.ajax({
                url: url + "/search",
                method: "GET",
                data: {_token: access_token, input: input, page: searchPage},
                dataType: "JSON",
                success: (data) => {
                    setSearchLoading(false);
                    if (searchPage < 2) {
                        $(".search-records").html(data.records);
                    } else {
                        $(".search-records").append(data.records);
                    }

                    if (data.total > 0) {
                        $('.listOfContacts').css('height', 'auto');
                        $('.message-hint').css('display', 'none');
                        $('.messenger-search').val("");
                        $('.search-records .messenger-list-item').
                            trigger('click');
                        /*const userID = $('.search-records .messenger-list-item').data('contact');
                        updateContatctItem(userID);*/
                        /*console.log(userID);*/
                    } else {
                        $(".search-records").css('height', '100')
                    }
                    // update data-action required with [responsive design]
                    cssMediaQueries();
                    // Pagination lock & messages page
                    noMoreDataSearch = searchPage >= data?.last_page;
                    if (!noMoreDataSearch) searchPage += 1;
                },
                error: (error) => {
                    setSearchLoading(false);
                    console.error(error);
                },
            });
        }
    }

    /**
     *-------------------------------------------------------------
     * Delete Conversation
     *-------------------------------------------------------------
     */
    function deleteConversation(id) {
        $.ajax({
            url: url + "/deleteConversation",
            method: "POST",
            data: {_token: access_token, id: id},
            dataType: "JSON",
            beforeSend: () => {
                // hide delete modal
                app_modal({
                    show: false,
                    name: "delete",
                });
                // Show waiting alert modal
                app_modal({
                    show: true,
                    name: "alert",
                    buttons: false,
                    body: loadingSVG("32px", null, "margin:auto"),
                });
            },
            success: (data) => {
                // delete contact from the list
                $(".listOfContacts").
                    find(".messenger-list-item[data-contact=" + id + "]").
                    remove();
                // refresh info
                IDinfo(id, getMessengerType());

                data.deleted ? "" : console.error("Error occured!");

                // Hide waiting alert modal
                app_modal({
                    show: false,
                    name: "alert",
                    buttons: true,
                    body: "",
                });
            },
            error: () => {
                console.error("Server error, check your response");
            },
        });
    }

    function updateSettings() {
        const formData = new FormData($("#update-settings")[0]);
        if (messengerColor) {
            formData.append("messengerColor", messengerColor);
        }
        if (dark_mode) {
            formData.append("dark_mode", dark_mode);
        }
        $.ajax({
            url: url + "/updateSettings",
            method: "POST",
            data: formData,
            dataType: "JSON",
            processData: false,
            contentType: false,
            beforeSend: () => {
                // close settings modal
                app_modal({
                    show: false,
                    name: "settings",
                });
                // Show waiting alert modal
                app_modal({
                    show: true,
                    name: "alert",
                    buttons: false,
                    body: loadingSVG("32px", null, "margin:auto"),
                });
            },
            success: (data) => {
                if (data.error) {
                    // Show error message in alert modal
                    app_modal({
                        show: true,
                        name: "alert",
                        buttons: true,
                        body: data.msg,
                    });
                } else {
                    // Hide alert modal
                    app_modal({
                        show: false,
                        name: "alert",
                        buttons: true,
                        body: "",
                    });

                    // reload the page
                    location.reload(true);
                }
            },
            error: () => {
                console.error("Server error, check your response");
            },
        });
    }

    /**
     *-------------------------------------------------------------
     * Set Active status
     *-------------------------------------------------------------
     */
    function setActiveStatus(status, user_id) {
        $.ajax({
            url: url + "/setActiveStatus",
            method: "POST",
            data: {_token: access_token, user_id: user_id, status: status},
            dataType: "JSON",
            success: (data) => {
                // Nothing to do
            },
            error: () => {
                console.error("Server error, check your response");
            },
        });
    }

    /**
     *-------------------------------------------------------------
     * On DOM ready
     *-------------------------------------------------------------
     */
    $(document).ready(function() {
        // get contacts list
        getContacts();

        // get contacts list
        getFavoritesList();

        // Clear typing timeout
        clearTimeout(typingTimeout);

        // NProgress configurations
        NProgress.configure({showSpinner: false, minimum: 0.7, speed: 500});

        // make message input autosize.
        autosize($(".m-send"));

        // check if pusher has access to the channel [Internet status]
        pusher.connection.bind("state_change", function(states) {
            let selector = $(".internet-connection");
            checkInternet(states.current, selector);

            // listening for pusher:subscription_succeeded
            channel.bind("pusher:subscription_succeeded", function() {
                // On connection state change [Updating] and get [info & msgs]
                if (getMessengerId() != 0) {
                    if (
                        $(".messenger-list-item").
                            find("tr[data-action]").
                            attr("data-action") == "1"
                    ) {
                        $(".messenger-listView").hide();
                    }
                    IDinfo(getMessengerId(), getMessengerType());
                }

                if (addChatUser) {
                    if ($.trim(addChatUser).length > 0) {
                        $(".messenger-search").trigger("focus");
                        try {
                            messengerSearch(addChatUser);
                        } finally {
                            setTimeout(function() {

                                if (city && date && time) {
                                    messageInput.val("Please wait for an agent to confirm your appointment on " + date + " at " + time +
                                        " in " + city + " with " + modelName + ". ...connecting now" );
                                    sendMessage();
                                    addChatUser = null;
                                } else {
                                    messageInput.val("Hey " + addChatUser +
                                        "! I just joined and I'm ready to chat.");
                                    sendMessage();
                                    addChatUser = null;
                                }

                            }, 1500)
                        }
                    }
                }
            });
        });

        // tabs on click, show/hide...
        $(".messenger-listView-tabs a").on("click", function() {
            var dataView = $(this).attr("data-view");
            $(".messenger-listView-tabs a").removeClass("active-tab");
            $(this).addClass("active-tab");
            $(".messenger-tab").hide();
            $(".messenger-tab[data-view=" + dataView + "]").show();
        });

        // set item active on click
        $("body").on("click", ".messenger-list-item", function() {
            const dataView = $(".messenger-list-item").
                find("p[data-type]").
                attr("data-type");
            $(".messenger-tab").hide();
            $(".messenger-tab[data-view=" + dataView + "s]").show();

            $(".messenger-list-item").removeClass("m-list-active");
            $(this).addClass("m-list-active");
            const userID = $(this).attr("data-contact");
            routerPush(document.title, `${url}/${userID}`);
            updateSelectedContact(userID);

            if ($(this).parent().hasClass('search-records')) {
                const table = $(this);
                table.appendTo('.listOfContacts');
            }
        });

        // show info side button
        $(".messenger-infoView nav a , .show-infoSide").on("click", function() {
            $(".messenger-infoView").toggle();
        });

        // make favorites card dragable on click to slide.
        hScroller(".messenger-favorites");

        // click action for list item [user/group]
        $("body").on("click", ".messenger-list-item", function() {
            if ($(this).find("tr[data-action]").attr("data-action") == "1") {
                $(".messenger-listView").hide();
            }
            const dataId = $(this).find("p[data-id]").attr("data-id");
            const dataType = $(this).find("p[data-type]").attr("data-type");
            setMessengerId(dataId);
            setMessengerType(dataType);
            IDinfo(dataId, dataType);
        });

        // click action for favorite button
        $("body").on("click", ".favorite-list-item", function() {
            if ($(this).find("div").attr("data-action") == "1") {
                $(".messenger-listView").hide();
            }
            const uid = $(this).find("div.avatar").attr("data-id");
            setMessengerId(uid);
            setMessengerType("user");
            IDinfo(uid, "user");
            updateSelectedContact(uid);
            routerPush(document.title, `${url}/${uid}`);
        });

        // list view buttons
        $(".listView-x").on("click", function() {
            $(".messenger-listView").hide();
        });
        $(".show-listView").on("click", function() {
            $(".messenger-listView").show();
        });

        // click action for [add to favorite] button.
        $(".add-to-favorite").on("click", function() {
            star(getMessengerId());
        });

        // calling Css Media Queries
        cssMediaQueries();

        // message form on submit.
        $("#message-form").on("submit", (e) => {
            e.preventDefault();
            sendMessage();
        });

        // message input on keyup [Enter to send, Enter+Shift for new line]
        $("#message-form .m-send").on("keyup", (e) => {
            // if enter key pressed.
            if (e.which == 13 || e.keyCode == 13) {
                // if shift + enter key pressed, do nothing (new line).
                // if only enter key pressed, send message.
                let triggered;
                if (!e.shiftKey) {
                    triggered = isTyping(false);
                    sendMessage();
                }
            }
        });

        // On [upload attachment] input change, show a preview of the image/file.
        $("body").on("change", ".upload-attachment", (e) => {
            let file = e.target.files[0];
            if (!attachmentValidate(file)) return false;
            let reader = new FileReader();
            let sendCard = $(".messenger-sendCard");
            reader.readAsDataURL(file);
            reader.addEventListener("loadstart", (e) => {
                $("#message-form").before(loadingSVG());
            });
            reader.addEventListener("load", (e) => {
                $(".messenger-sendCard").find(".loadingSVG").remove();
                if (!file.type.match("image.*")) {
                    // if the file not image
                    sendCard.find(".attachment-preview").remove(); // older one
                    sendCard.prepend(attachmentTemplate("file", file.name));
                } else {
                    // if the file is an image
                    sendCard.find(".attachment-preview").remove(); // older one
                    sendCard.prepend(
                        attachmentTemplate("image", file.name, e.target.result)
                    );
                }
            });
        });

        function attachmentValidate(file) {
            const fileElement = $(".upload-attachment");
            const allowedExtensions = [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "zip",
                "rar",
                "txt",
            ];
            const sizeLimit = 5000000; // 5 megabyte
            const {name: fileName, size: fileSize} = file;
            const fileExtension = fileName.split(".").pop();
            if (!allowedExtensions.includes(fileExtension)) {
                alert("file type not allowed");
                fileElement.val("");
                return false;
            }
            // Validate file size.
            if (fileSize > sizeLimit) {
                alert("Please select file size less than 5 MiB");
                return false;
            }
            return true;
        }

        // Attachment preview cancel button.
        $("body").on("click", ".attachment-preview .cancel", () => {
            cancelAttachment();
        });

        // typing indicator on [input] keyDown
        $("#message-form .m-send").on("keydown", () => {
            if (typingNow < 1) {
                // Trigger typing
                let triggered = isTyping(true);
                triggered
                    ? console.info("[+] Triggered")
                    : console.error("[+] Not triggered");
                // Typing now
                typingNow = 1;
            }
            // Clear typing timeout
            clearTimeout(typingTimeout);
            // Typing timeout
            let triggered;
            typingTimeout = setTimeout(function() {
                triggered = isTyping(false);
                triggered
                    ? console.info("[-] Triggered")
                    : console.error("[-] Not triggered");
                // Clear typing now
                typingNow = 0;
            }, 1000);
        });

        // Image modal
        $("body").on("click", ".chat-image", function() {
            let src = $(this).css("background-image").split(/"/)[1];
            $("#imageModalBox").show();
            $("#imageModalBoxSrc").attr("src", src);
        });
        $(".imageModal-close").on("click", function() {
            $("#imageModalBox").hide();
        });

        // Search input on focus
        /*$(".messenger-search").on("focus", function () {
          $(".messenger-tab").hide();
          $('.messenger-tab[data-view="search"]').show();
        });*/
        /*$(".messenger-search").on("blur", function () {
          setTimeout(function () {
            $(".messenger-tab").hide();
            $('.messenger-tab[data-view="users"]').show();
          }, 200);
        });*/
        // Search action on keyup
        /*$(".messenger-search").on("submit", function (e) {
          $.trim($(this).val()).length > 0
            ? $(".messenger-search").trigger("focus") + messengerSearch($(this).val())
            : $(".messenger-tab").hide() +
              $('.messenger-listView-tabs a[data-view="users"]').trigger("click");
        });*/

        $("#add_user_form").on("submit", function(e) {
            e.preventDefault();
            const userValue = $('.messenger-search').val();
            $('.messenger-search').val = "";

            $.trim(userValue).length > 0
                ?
                $(".messenger-search").trigger("focus") +
                messengerSearch(userValue)
                :
                $(".messenger-tab").hide() +
                $('.messenger-listView-tabs a[data-view="users"]').
                    trigger("click");
        });

        // Delete Conversation button
        $(".messenger-infoView-btns .delete-conversation").
            on("click", function() {
                app_modal({
                    name: "delete",
                });
            });
        // delete modal [delete button]
        $(".app-modal[data-name=delete]").
            find(".app-modal-footer .delete").
            on("click", function() {
                deleteConversation(getMessengerId());
                app_modal({
                    show: false,
                    name: "delete",
                });
            });
        // delete modal [cancel button]
        $(".app-modal[data-name=delete]").
            find(".app-modal-footer .cancel").
            on("click", function() {
                app_modal({
                    show: false,
                    name: "delete",
                });
            });

        // Settings button action to show settings modal
        $("body").on("click", ".settings-btn", function(e) {
            e.preventDefault();
            app_modal({
                show: true,
                name: "settings",
            });
        });

        // on submit settings' form
        $("#update-settings").on("submit", (e) => {
            e.preventDefault();
            updateSettings();
        });
        // Settings modal [cancel button]
        $(".app-modal[data-name=settings]").
            find(".app-modal-footer .cancel").
            on("click", function() {
                app_modal({
                    show: false,
                    name: "settings",
                });
                cancelUpdatingAvatar();
            });
        // upload avatar on change
        $("body").on("change", ".upload-avatar", (e) => {
            // store the original avatar
            if (defaultAvatarInSettings == null) {
                defaultAvatarInSettings = $(".upload-avatar-preview").css(
                    "background-image"
                );
            }
            let file = e.target.files[0];
            if (!attachmentValidate(file)) return false;
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener("loadstart", (e) => {
                $(".upload-avatar-preview").append(
                    loadingSVG("42px", "upload-avatar-loading")
                );
            });
            reader.addEventListener("load", (e) => {
                $(".upload-avatar-preview").find(".loadingSVG").remove();
                if (!file.type.match("image.*")) {
                    // if the file is not an image
                    console.error("File you selected is not an image!");
                } else {
                    // if the file is an image
                    $(".upload-avatar-preview").css(
                        "background-image",
                        'url("' + e.target.result + '")'
                    );
                }
            });
        });
        // change messenger color button
        $("body").on("click", ".update-messengerColor .color-btn", function() {
            messengerColor = $(this).attr("data-color");
            $(".update-messengerColor .color-btn").
                removeClass("m-color-active");
            $(this).addClass("m-color-active");
        });
        // Switch to Dark/Light mode
        $("body").on("click", ".dark-mode-switch", function() {
            if ($(this).attr("data-mode") == "0") {
                $(this).attr("data-mode", "1");
                $(this).removeClass("far");
                $(this).addClass("fas");
                dark_mode = "dark";
            } else {
                $(this).attr("data-mode", "0");
                $(this).removeClass("fas");
                $(this).addClass("far");
                dark_mode = "light";
            }
        });

        //Messages pagination
        actionOnScroll(
            ".m-body.messages-container",
            function() {
                fetchMessages(getMessengerId(), getMessengerType());
            },
            true
        );
        //Contacts (users) pagination
        actionOnScroll(".messenger-tab.users-tab", function() {
            getContacts();
        });
        //Search pagination
        actionOnScroll(".messenger-tab.search-tab", function() {
            messengerSearch($(".messenger-search").val());
        });

        const windowHeight = window.innerHeight;
        const messages = document.querySelector('.messages');
        messages.style.maxHeight = (windowHeight - 180) + "px";

        $(window).on('resize', function() {
            const windowHeight = window.innerHeight;
            const messages = document.querySelector('.messages');
            messages.style.maxHeight = (windowHeight - 180) + "px";
        })

    });

    // Called after message is sent to check if Bot response should be sent.
    async function checkForAgentResponse(message) {

        const toID = getBotTo();
        const fromID = getBotFrom();

        const statusPackets = {
            column: 'active',
            userID: fromID
        }

        //get agent settings to see if bot enabled
        return await axios.post('/get-setting', statusPackets).
            then((status) => {

                if (status.data.active) {
                    const firstPart = message.split('<p>');
                    const secondPart = firstPart[1].split('<sub');
                    let final = secondPart[0].replaceAll('\n', ' ');
                    final = final.replaceAll('<br />', '');
                    //call to get bot response
                    getResponse(final, toID, fromID);
                }
            });
    }

    //Get the bot response based on user message input
    function getResponse(message, sendTo, fromID) {

        //let response = null;
        let text = message.toLowerCase().replace(/[^\w\s\d]/gi, "");
        text = text.replace(/ a /g, " ").
            replace(/i feel /g, "").
            replace(/whats/g, "what is").
            replace(/what[']s/g, "what is").
            replace(/please /g, "").
            replace(/ please/g, "");

        /*if (text.match(/picture/gi) || text.match(/pic/gi) ||
            text.match(/photo/gi) || text.match(/pics/gi) ||
            text.match(/pix/gi)) {
            //sendPic = 1;

            //send to id, send from id, message, send pic
            sendBotMessage(sendTo, fromID, null, 1);

        } else {*/

            sendReply(
                sendTo,
                fromID,
                text
            );
        /*}*/
    }

    async function sendReply(
        sendTo,
        fromID,
        text
    ) {

        const keywordPackets = {
            column: 'keywords',
            userID: fromID
        }

        try {

            return await axios.post('/get-setting', keywordPackets).
                then((keywordResponse) => {

                    let triggers = [];
                    let replies = [];
                    keywordResponse.data.keywords.map((keywords) => {

                        const [keyword, ...reply] = keywords.split('|');
                        triggers.push(keyword);
                        replies.push(reply);
                    })

                    if (compare(triggers, replies, text)) {
                        let botMessage = compare(triggers, replies, text);

                        if (botMessage.match(/%s/gi)) {

                            const linksPackets = {
                                column: 'links',
                                userID: fromID
                            }

                            axios.post('/get-setting', linksPackets).
                                then((response) => {
                                    const link = response.data.links[Math.floor(Math.random() * response.data.links.length)];

                                    botMessage = botMessage.replace("%s", link);

                                    if (botMessage.includes("%p")) {

                                        const index = botMessage.indexOf("%p");
                                        const token = botMessage.substr(index, 3);
                                        const split = token.split("p");

                                        botMessage = botMessage.replace(
                                            "%p" + split[1], "");

                                        sendBotMessage(sendTo, fromID, botMessage,
                                            1, split[1])
                                    } else {
                                        sendBotMessage(sendTo, fromID, botMessage);
                                    }
                                });
                        } else if (botMessage.match(/%a/gi)) {

                            const agePackets = {
                                column: 'age',
                                userID: fromID
                            }

                            axios.post('/get-setting', agePackets).
                                then((response) => {

                                    const age = response.data.age;

                                    botMessage = botMessage.replace("%a", age);

                                    sendBotMessage(sendTo, fromID, botMessage);

                                });


                        } else if (botMessage.match(/%n/gi)) {

                            const namePackets = {
                                column: 'name',
                                userID: fromID
                            }

                            axios.post('/get-setting', namePackets).
                                then((response) => {

                                    const name = response.data.name;

                                    botMessage = botMessage.replace("%n", name);

                                    sendBotMessage(sendTo, fromID, botMessage);

                                });
                        } else if (botMessage.includes("%p")) {

                            const index = botMessage.indexOf("%p");
                            const token = botMessage.substr(index, 3);
                            const split = token.split("p");

                            botMessage = botMessage.replace("%p" + split[1], "");

                            // sent message to, message from, bot message, send pic, pic number
                            sendBotMessage(sendTo, fromID, botMessage, 1, split[1]);

                        } else {
                            sendBotMessage(sendTo, fromID, botMessage);
                        }

                    } else {
                        sendScript(sendTo, fromID);
                    }

                })
        } catch (err) {
            console.error(err);
        }
    }

    async function sendScript(sendTo, fromID) {

        const scriptPackets = {
            column: 'script',
            userID: fromID
        }

        const trackingPackets = {
            to_id: sendTo,
            from_id: fromID
        }

        return await axios.post('/get-setting', scriptPackets).
            then(async (response) => {

                const index = await axios.post('/script-tracking',
                    trackingPackets)

                const newIndex = index.data.index;
                let botMessage;
                if (newIndex === 999) {
                    botMessage = "That's all I got";
                    sendBotMessage(sendTo, fromID, botMessage)
                } else {
                    botMessage = response.data.script[newIndex];

                    if (botMessage.includes("%s")) {

                        const linksPackets = {
                            column: 'links',
                            userID: fromID
                        }
                        axios.post('/get-setting', linksPackets).
                            then((response) => {
                                const link = response.data.links[Math.floor(Math.random() * response.data.links.length)];

                                botMessage = botMessage.replace("%s", link);

                                if (botMessage.includes("%p")) {

                                    const index = botMessage.indexOf("%p");
                                    const token = botMessage.substr(index, 3);
                                    const split = token.split("p");

                                    botMessage = botMessage.replace(
                                        "%p" + split[1], "");

                                    sendBotMessage(sendTo, fromID, botMessage,
                                        1, split[1])
                                } else {
                                    sendBotMessage(sendTo, fromID, botMessage)
                                }
                            });
                    } else if (botMessage.match(/%a/gi)) {

                        const agePackets = {
                            column: 'age',
                            userID: fromID
                        }

                        axios.post('/get-setting', agePackets).
                            then((response) => {
                                const age = response.data.age;

                                botMessage = botMessage.replace("%a", age);

                                sendBotMessage(sendTo, fromID, botMessage);

                            });


                    } else if (botMessage.match(/%n/gi)) {

                        const namePackets = {
                            column: 'name',
                            userID: fromID
                        }

                        axios.post('/get-setting', namePackets).
                            then((response) => {

                                const name = response.data.name;

                                botMessage = botMessage.replace("%n", name);

                                sendBotMessage(sendTo, fromID, botMessage);

                            });
                    } else if (botMessage.includes("%p")) {

                        const index = botMessage.indexOf("%p");
                        const token = botMessage.substr(index, 3);
                        const split = token.split("p");

                        botMessage = botMessage.replace("%p" + split[1], "");

                        sendBotMessage(sendTo, fromID, botMessage, 1, split[1])

                    } else {

                        sendBotMessage(sendTo, fromID, botMessage)
                    }
                }
            })
    }

    function sendBotMessage(sendTo, fromID, botMessage, sendPic = 0, picNumber = null) {

        setMessengerId(sendTo);
        setAuthId(fromID);
        botTyping = true;

        const randomTime1 = Math.floor(Math.random() * (15000 - 5000) + 5000);
        const randomTime2 = Math.floor(Math.random() * (35000 - 20000) + 20000);

        const typingIndicator = document.querySelector('.typing-indicator');

        setTimeout(() => {
            typingIndicator.style.display = "block";
        }, randomTime1)

        setTimeout(() => {
            messageInput.val(botMessage);
            sendMessage(sendTo, fromID, sendPic, picNumber);
            setMessengerId(fromID);
            setAuthId(sendTo);
            botTyping = false;
            isTyping(false);
            typingIndicator.style.display = "none";

            setTimeout(() => {
                sendQueue(sendTo, fromID);
            }, 2000);

        }, randomTime2)
    }

    function compare(triggerArray, replyArray, text) {
        let item;

        for (let x = 0; x < triggerArray.length; x++) {

            for (let y = 0; y < replyArray.length; y++) {

                if (triggerArray[x] !== undefined) {

                    let myReg = new RegExp(triggerArray[x].trim(), "g")

                    if (text.trim().match(myReg)) {
                        let items = replyArray[x];
                        item = items[Math.floor(Math.random() * items.length)];
                    }
                }
            }
        }

        return item;
    }

    function sendQueue(sendTo, fromID) {

        if (queue.length() > 0) {
            setBotTo(sendTo)
            setBotFrom(fromID);
            const message = queue.getFront();
            const newQueue = queue.dequeue();
            checkForAgentResponse(message);
        }
    }

}
