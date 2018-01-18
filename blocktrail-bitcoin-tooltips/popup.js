
document.addEventListener('DOMContentLoaded', function() {

    //request the number of links found in the currently open tab
    var query = { active: true, currentWindow: true };
    chrome.tabs.query(query, function(results){
        chrome.tabs.sendMessage(results[0].id, {action: 'request_tooltip_count'}, function(response) {
            $(".tbtc-address-count").text(response.tbtc_tooltips_count);
            $(".btc-address-count").text(response.btc_tooltips_count);
            console.log('got a response', response);
        });
    });
});