
function BlocktrailBitTips() {
    this.COIN = 100000000;
    this.PRECISION = 8;
    this.API_URL = "https://api.blocktrail.com/";
    this.API_VERSION = "v1";
    this.API_KEY = "MY_APIKEY";

    //match where space, string start/end or non-word character precedes and follows the address (split into a group for separation from the address itself)
    this.btcRegex = /([\s|\W]+|^)([13][a-km-zA-HJ-NP-Z0-9]{25,34})([\s|\W]+|$)/g;
    this.tBtcRegex = /([\s|\W]+|^)([2mn][a-km-zA-HJ-NP-Z0-9]{25,34})([\s|\W]+|$)/g;

    this.template = '<h4>%address%</h4>'
    + 'balance: %balance% BTC<br>'
    + 'transactions: %transactions%<br>'
    + '<span class="%tag_display%">tag: %category%  %tag%</span>';
    //+ '<a href="%link%" target="_blank">more info</a>';
}

BlocktrailBitTips.prototype.tooltipTemplate = function(templateData) {
    var tooltipHTML = this.template;
    $.each(templateData, function(index, value) {
        tooltipHTML = tooltipHTML.replace("%"+index+"%", value);
    });

    return tooltipHTML;
};

BlocktrailBitTips.prototype.toBTC = function(satoshi) {
    return (satoshi / this.COIN).toFixed(this.PRECISION);
};

BlocktrailBitTips.prototype.scan = function() {
    var self = this;

    $('a:not(.bt-bitcoin-tooltip)').each(function(key, val) {
        //try match bitcoin address in both href and anchor text
        var searchText = $(this).text() + " " + $(this).attr('href');
        var matches = self.btcRegex.exec(searchText);

        if(matches != null) {
            $(this).addClass('bt-bitcoin-tooltip');
            $(this).attr('data-network', 'btc').attr('data-address', matches[2]);   //get the second group of the match

            //need to reset the indexes of each regex as we are using the global modifier
            self.btcRegex.lastIndex = 0;
        } else {
            //try match testnet address
            matches = self.tBtcRegex.exec(searchText);

            if(matches != null) {
                $(this).addClass('bt-bitcoin-tooltip');
                $(this).attr('data-network', 'tbtc').attr('data-address', matches[2]);

                //need to reset the indexes of each regex as we are using the global modifier
                self.tBtcRegex.lastIndex = 0;
            }
        }
    });

    $('.bt-bitcoin-tooltip').qtip({
        content: {
            text: function(event, api) {
                //get the info about the address
                var address = $(this).data('address');
                var network = $(this).data('network');

                return $.ajax({
                    url: self.API_URL + self.API_VERSION + "/" + network + "/address/" + address,
                    data: {api_key: self.API_KEY},
                    type: "GET",
                    cache: false,
                    dataType: 'json'
                }).then(
                    function success(data){
                        var templateData = {
                            address: data.address,
                            balance: self.toBTC(data.balance),
                            transactions: data.total_transactions_in + data.total_transactions_out,
                            category: data.category,
                            tag: data.tag,
                            tag_display: (data.category || data.tag) ? "show" : "hide",
                            link: "https://www.blocktrail.com/"+network+"/address/"+data.address
                        };

                        return self.tooltipTemplate(templateData);
                    },
                    function error(xhr, status, error){
                        //console.log('Oh noes, an error!', error);
                        api.set('content.text', 'Oh noes, an error happened!');
                    });
            }
        },
        position: {
            my: 'bottom left',  // Position my top left...
            at: 'top left',     // at the bottom right of...
            target: false,
            effect: false,      // disable default slide animation
            adjust: { x: 2}
        },
        style: {
            classes: 'qtip-tipsy qtip-shadow bt-qtip-custom'
        },
        overwrite: false    //don't destroy existing qtips when re-initialising
    });
};
