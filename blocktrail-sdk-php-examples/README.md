BlockTrail SDK PHP Example Usage
================================

This project contains some example code on how to use the BlockTrail PHP SDK.  
The example code intentionally doesn't use any libraries other than the BlockTrail PHP SDK.

Received Webhook Example
------------------------
The `examples/receive_webhook/receive.php` contains the code to receive and use the data from a webhook.  
You can setup a webhook and subscribe to events 
using the SDK or from your [Webhooks Dashboard](http://blocktrail.localhost/user/dashboard/webhooks) on the website.

You can also use the [Webhook Tester](http://blocktrail.localhost/user/dashboard/tools/webhook-tester) tools on our website
to send test data to your webhook so you don't have to wait for events to happen or you can repeat the same event multiple times.

Setup Webhook Example
---------------------
The `examples/setup_webhook/setup.php` contains the code to setup a webhook and subscribe to events.  
It also contains to code to read from a CSV if it exists (`examples/setup_webhook/addresses.csv`) and subscribe to addresses found in the CSV.

Pro Tip; Easy Way to run Examples
---------------------------------
Starting from PHP 5.4 you can run a development webserver on your local machine using `php -S 127.0.0.1:8081`.  
You will be able to execute scripts from your current directory if you goto `http://localhost:8081` 
(eg if you run the command from the `examples/receive_webhook` directory then `http://localhost:8081/receive.php` 
will run `examples/receive_webhook/receive.php`.

Unfortunatly our servers can't directly send data to your localhost, 
but ff you install [ngrok](https://ngrok.com/) then you can let ngrok tunnel trafic to your localhost.  
So if you run `./ngrok -subdomain=<YOUR_NAME_HERE> 8081` then everyone can access `http://<YOUR_NAME_HERE>.ngrok.com` 
which will go directly to the development webserver you're running.

So you could for example then test the receiving of webhook data using the [Webhook Tester](http://blocktrail.localhost/user/dashboard/tools/webhook-tester)
by entering `http://<YOUR_NAME_HERE>.ngrok.com` as domain!
