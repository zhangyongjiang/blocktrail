<?php

use BitWasp\BitcoinLib\BitcoinLib;
use Blocktrail\SDK\BlocktrailSDK;
use Blocktrail\SDK\Exceptions\BlocktrailSDKException;

require_once __DIR__ . "/../../vendor/autoload.php";

/*
 * make sure you replace the MY_APIKEY and MY_APISECRET with your own key and secret!
 */
$blocktrail = new BlocktrailSDK("MY_APIKEY", "MY_APISECRET");

$webhookID = "my-example-webhook";

// create the webhook, you should put a real URL here
$blocktrail->setupWebhook("http://rubensayshi.ngrok.com/webhook/test", $webhookID);

// subscribe to receive a webhook call when a new block is found
$blocktrail->subscribeNewBlocks($webhookID);

// subscribe to receive a webhook call when a transaction happens on 1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp
//  you will receive a webhook call for every unconfirmed transaction and the first 6 confirmations
$blocktrail->subscribeAddressTransactions($webhookID, "1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp", 6);

// if there's a `examples/setup_webhook/addresses.csv` we loop over it
//  for every value in there that's a valid address we subscribe
if (file_exists(__DIR__ . "/addresses.csv")) {
    $file = file_get_contents(__DIR__ . "/addresses.csv");
    $lineSeperator = strpos($file, "\r\n") !== false ? "\r\n" : "\n";
    $lines = explode($lineSeperator, $file);

    $addresses = [];
    foreach ($lines as $line) {
        $values = explode(",", $line);
        foreach ($values as $value) {
            // check if this value is a valid address
            if (BitcoinLib::validate_address($value)) {
                $addresses[] = $value;
            }
        }
    }

    foreach (array_chunk($addresses, 500) as $chunk) {
        $data = array_map(function($address) { return ['address' => $address, 'confirmations' => 6]; }, $chunk);
        $blocktrail->batchSubscribeAddressTransactions($webhookID, $data);
    }
}
