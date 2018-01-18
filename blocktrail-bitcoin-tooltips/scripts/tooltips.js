
chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    switch(data.action) {
        case "request_tooltip_count":
            //count the total number of tooltips found on the page and return to sender
            var responseData = {
                btc_tooltips_count: $('.bt-bitcoin-tooltip[data-network="btc"]').length,
                tbtc_tooltips_count: $('.bt-bitcoin-tooltip[data-network="tbtc"]').length
            };

            sendResponse(responseData);
            break;
        default:
            //unhandled message
            //console.log('tooltips: not sure what to do with this message...', data, sender);
    }

    //keep the message channel open for other handlers to send a response
    return true;
});

/**
 * checks the domain against a list of sites known to change DOM content after pageload,
 * requiring a delayed scan for correct tooltip data to be created
 */
function detectDelayScanning() {
    var hostname = window.location.origin;
    var siteList = [
        'facebook.com',
        'twitter.com'
    ];

    var regex = new RegExp(siteList.join(),"i");
    return !!hostname.match(regex);
}

$(document).ready(function(){
    var bt = new BlocktrailBitTips();
    console.log('Blocktrail tooltips extension...ready!');

    //scan the page and setup tooltips for any bitcoin/testnet addresses
    //detect if delayed scanning is required based on a list of known troublesome sites
    if (detectDelayScanning()) {
        setTimeout(function() {bt.scan();}, 2000);
    } else {
        bt.scan();
    }

    //on activate tab, set rescan interval
    //chrome.tabs.onActivated.addListener(function (activeInfo) {
    //    console.log('tab activated', activeInfo);
    //});

    var rescan = setInterval(function() {
        //console.log('rescan');
        bt.scan();
    }, 2000);

    // on deactivate tab clearInterval(rescan);
    //...

});
