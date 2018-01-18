<?php

use Blocktrail\SDK\BlocktrailSDK;

require_once __DIR__ . "/../../vendor/autoload.php";

/*
 * get JSON post data by reading from stdin
 *
 * note; before PHP 5.6 you can only read from `php://input` once
 *       so if you have a framework/CMS than you need to check if it doesn't already read it before you
 *       and if it does you need to get it from the framework instead of directly from `php://input`
 */
$postData = file_get_contents("php://input");
if (!$postData) {
    throw new \Exception("Failed to get POST body");
}

$postData = json_decode($postData, true);
if (!$postData) {
    throw new \Exception("Failed to decode JSON from POST body");
}

$network = $postData['network']; // BTC or tBTC
$eventType = $postData['event_type']; // address-transactions or block

if ($eventType == 'address-transactions') {
    // transaction data, same structure as the data API transaction endpoint
    $txData = $postData['data'];

    echo "Received webhook for transaction [{$txData['hash']}]. \n";

    if ($txData['confirmations'] == 0) {
        echo "This transaction has 0 confirmations, it's advised to wait for at least 1 confirmation before relying on a transaction. \n";
    } else if ($txData['confirmations'] < 6) {
        echo "This transaction was first confirmed in block at height {$txData['block_height']} and now has {$txData['confirmations']} confirmations. ";
        echo "It's pretty safe to rely on this transaction. ";
        echo "Though for very high value transaction it's advised to wait for at least 6 confirmations. \n";
    } else {
        echo "This transaction was first confirmed in block at height {$txData['block_height']} and now has {$txData['confirmations']} confirmations. ";
        echo "It's safe to rely on this transaction. \n";
    }

    // list of addresses you're subscribed to and their balance change
    //  if you're subscribed to multiple addresses and there are multiple of them in this transaction
    //  then this can be more than 1 of course
    $addresses = $postData['addresses'];

    /*
     * there are 2 possible ways to determine if it's an incoming or outgoing transaction
     *  1) sum up the balance change (negative for inputs, positive for outputs)
     *      for all the addresses that are 'yours'
     *     if the total balance change is positive then it's an incoming transaction, otherwise outgoing
     *
     *  2) check if any of 'your' addresses are on the inputs side of the transaction
     *      then it's an outgoing transaction
     *
     * in some really odd transactions it sometimes happens addresses are on the input side
     *  and on the output side and end up getting a positive balance
     *
     * the example below will try to print information about the transaction based on
     *  only the knowledge of the addresses you're subscribed too
     * in reality you probably know what each address' purpose is
     *  and you can write your code orientated on that instead of this generic approach the example takes
     *
     * note; bitcoin purists will tell there's no such thing as incoming/outgoing/sending/receiving
     *       but for any normal person they're concepts we need / use to describe what's going on xD
     */

    // sum of balance changes for all addresses you're subscribed too
    //  assuming you're subscribed to all te addresses that are 'yours'
    //  this will be positive if you're receiving a TX and negative if you're sending a TX
    $totalBalanceChange = array_sum($addresses);

    // incoming transaction
    if ($totalBalanceChange > 0) {
        echo "Incoming transaction. Balance change; {$totalBalanceChange}. \n";

    // outgoing transaction
    } else if ($totalBalanceChange < 0) {
        echo "Outgoing transaction. Balance change; {$totalBalanceChange}. \n";

    // odd transaction
    } else {
        echo "Odd transaction. Balance remained the same. \n";
    }

    // loop over the addresses that you were subscribed to and print a line of text
    foreach ($addresses as $address => $balanceChange) {
        if ($balanceChange > 0) {
            $balanceChangeInBtc = BlocktrailSDK::toBTC($balanceChange);
            echo "Address [{$address}] has received {$balanceChange} Satoshis, which is {$balanceChangeInBtc} BTC. \n";
        } else if ($balanceChange < 0) {
            $balanceChangeInBtc = BlocktrailSDK::toBTC($balanceChange);
            echo "Address [{$address}] has sent {$balanceChange} Satoshis, which is {$balanceChangeInBtc} BTC. \n";
        } else {
            echo "Address [{$address}] was part of a transaction, but it's balance remained the same (this is odd). \n";
        }
    }

    // create a list of 'senders' by taking all addresses from the inputs
    $sendingAddresses = [];
    foreach ($txData['inputs'] as $input) {
        if (isset($input['address'])) {
            // it's possible to have multiple inputs with the same address so we sum up
            if (!isset($sendingAddresses[$input['address']])) {
                $sendingAddresses[$input['address']] = 0;
            }
            $sendingAddresses[$input['address']] += $input['value'];
        }
    }

    // create a list of 'receivers' by taking all addresses from the outputs
    $receivingAddresses = [];
    foreach ($txData['outputs'] as $output) {
        if (isset($output['address'])) {
            $receivingAddresses[$output['address']] = $output['value'];
        }
    }

    // if it's an incoming transaction (determined by which addresses you're subscribed to)
    //  then display a list of the sending addresses
    if ($totalBalanceChange > 0) {
        // if this happens it's a bit odd
        if (array_intersect($sendingAddresses, array_keys($addresses))) {
            echo "Incoming transaction but one of the addresses you're subscribed to is also on the sending (input) side. \n";
        }

        // sort descending by value
        arsort($sendingAddresses);

        $firstAddress = key($sendingAddresses);
        $balanceChangeInBtc = BlocktrailSDK::toBTC($sendingAddresses[$firstAddress]);
        echo "Largest sending address; {$firstAddress} ({$balanceChangeInBtc} BTC) \n";

        foreach ($sendingAddresses as $address => $balanceChange) {
            if (!isset($addresses[$address])) {
                $balanceChangeInBtc = BlocktrailSDK::toBTC($balanceChange);
                echo "Sending address; {$address} ({$balanceChangeInBtc} BTC). \n";
            }
        }
    }

    // if it's an outgoing transaction (determined by which addresses you're subscribed to)
    //  then display a list of the receiving addresses
    if ($totalBalanceChange < 0) {
        // if this happens it's completely normal, probably the change being send back to the same address
        if (array_intersect($receivingAddresses, array_keys($addresses))) {
            echo "Outgoing transaction but one of the addresses you're subscribed to is also on the receiving (output) side. \n";
        }

        // sort descending by value
        arsort($receivingAddresses);

        $firstAddress = key($receivingAddresses);
        $balanceChangeInBtc = BlocktrailSDK::toBTC($receivingAddresses[$firstAddress]);
        echo "Largest receiving address; {$firstAddress} ({$balanceChangeInBtc} BTC) \n";

        foreach ($receivingAddresses as $address => $balanceChange) {
            if (!isset($addresses[$address])) {
                $balanceChangeInBtc = BlocktrailSDK::toBTC($balanceChange);
                echo "Receiving address; {$address} ({$balanceChangeInBtc} BTC). \n";
            }
        }
    }

} else if ($eventType == 'block') {
    $blockData = $postData['data']; // block data, same structure as the data API block endpoint

    echo "Received webhook for block [{$blockData['hash']}] with height [{$blockData['height']}]. \n";

} else {
    throw new \Exception("ERROR; received unknown webhook event type [{$eventType}]");
}
