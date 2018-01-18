/*
    injects an iframe into the page to keep all css styling separated for our modal window
    also controls when it's displayed/hidden via message listeners
*/

$(document).ready(function(){

    console.log('modal injector loaded');
    //create a modal window with an injected iFrame

    var iFrame  = $('<iframe id="blocktrail_modal_iframe" />').attr('src', chrome.extension.getURL("templates/blocktrail_modal.html"));
    $('body').append(iFrame);

    //register a message handler to display/hide the iframe
    window.onmessage = function(event){
        switch(event.data.action) {
            case "show_iframe":
                $('#blocktrail_modal_iframe').addClass('show-iframe');
                break;
            case "hide_iframe":
                $('#blocktrail_modal_iframe').removeClass('show-iframe');
                break;
            default:
                break;
        }
    };
});
