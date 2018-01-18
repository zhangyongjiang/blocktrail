#!/bin/bash

set -ef -o pipefail

if  [ -z "$TRAVIS_PHP_VERSION" ]; then
    echo "This script is meant to be executed on Travis CI."
    exit 1
fi

if [[ "$TRAVIS_PHP_VERSION" != "hhvm" &&
      "$TRAVIS_PHP_VERSION" != "hhvm-nightly" ]]; then

    git clone https://github.com/redis/hiredis.git \
    && pushd hiredis \
    && make \
    && sudo make install \
    && popd

    git clone https://github.com/nrk/phpiredis.git \
    && pushd phpiredis \
    && phpize \
    && ./configure --enable-phpiredis \
    && make \
    && make install \
    && popd

    phpenv config-add phpiredis.ini
fi

composer self-update
