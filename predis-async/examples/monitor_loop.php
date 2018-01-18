<?php

/*
 * This file is part of the Predis\Async package.
 *
 * (c) Daniele Alessandri <suppakilla@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

require __DIR__.'/../autoload.php';

$client = new Predis\Async\Client('tcp://127.0.0.1:6379');

$client->connect(function ($client) {
    echo "Connected to Redis, now listening for incoming messages...\n";

    $client->monitor(function ($event) {
        $message = "[T%d] Client %s sent `%s` on database #%d with the following arguments: %s.\n";

        $feedback = sprintf($message,
            $event->timestamp,
            $event->client,
            $event->command,
            $event->database,
            $event->arguments
        );

        echo $feedback;
    });
});

$client->getEventLoop()->run();
