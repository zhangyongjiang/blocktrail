/*
    Handles all functionality of the Blocktrail popup modal window, triggered via context menu items
 */

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    switch(data.action) {
        case "pay_address_modal":
            //instruct the parent window to show the iframe containing this modal
            window.top.postMessage({action: 'show_iframe'}, '*');

            //show the modal
            $('#btBitTipModal').removeClass().addClass('reveal-modal bt-text-center');
            $('#btBitTipModal .title').text("Scan to make a " + data.network + " payment");
            var content = "<div class='bt-bitcoin-payment-qr'></div>"
                        + "<p><i>" + data.address + "</i></p>"
                        + "<p>Scan the above QR with your wallet to send funds.</p>";
            $('#btBitTipModal .content').html(content);

            //generate the QR code
            var protocol = "bitcoin:";
            if (data.network.toLowerCase() == 'tbtc') {
                protocol = ''
            }
            var options = {
                text: protocol + data.address
            };
            $(".bt-bitcoin-payment-qr").qrcode(options);

            $('#btBitTipModal').reveal({
                animation: 'fadeAndPop',                   //fade, fadeAndPop, none
                animationspeed: 300,                       //how fast animtions are
                closeonbackgroundclick: true,              //if you click background will modal close?
                dismissmodalclass: 'close-reveal-modal',   //the class of a button or element that will close an open modal
                onClose: function() {
                    //instruct the parent window to hide the iframe containing this modal
                    setTimeout(function() {
                        window.top.postMessage({action: 'hide_iframe'}, '*');
                    }, 800);
                }
            });
            break;
        case "invalid_address_modal":
            //instruct the parent window to show the iframe containing this modal
            window.top.postMessage({action: 'show_iframe'}, '*');

            //show the modal
            $('#btBitTipModal').removeClass().addClass('reveal-modal');
            var content = "<p> The selection <b>'" + data.search + "'</b> is not a valid address.</p>";
            $('#btBitTipModal .title').text("Invalid address");
            $('#btBitTipModal .content').html(content);
            $('#btBitTipModal').reveal({
                animation: 'fadeAndPop',                   //fade, fadeAndPop, none
                animationspeed: 300,                       //how fast animations are
                closeonbackgroundclick: true,              //if you click background will modal close?
                dismissmodalclass: 'close-reveal-modal',    //the class of a button or element that will close an open modal
                onClose: function() {
                    //instruct the parent window to hide the iframe containing this modal
                    setTimeout(function() {
                        window.top.postMessage({action: 'hide_iframe'}, '*');
                    }, 800);
                }
            });
            break;
        case "address_qr_modal":
            //chrome.tabs.update(tab.id, {url: "https://www.blocktrail.com"});      //redirect current tab
            chrome.tabs.create({url: blocktrailUrl});        //navigate in new ta
            break;
        default:
            //unhandled message
            //console.log('modal: not sure what to do with this message...', data, sender);
    }

    //keep the message channel open for other handlers to send a response
    return true;
});


$(document).ready(function(){
    //console.log('blocktrail modal script loaded');
});
