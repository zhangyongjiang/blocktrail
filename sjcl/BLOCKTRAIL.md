#### Why Fork?

We need this package in blocktrail/blocktrail-sdk-nodejs, and blocktrail/bip39

Build command:

    ./configure --with-{aes,gcm,pbkdf2,sha512,sha256} && make

SDK needs it for V3 encryption
 - AES
 - GCM
 - pbkdf2
 - sha512

BIP39 needs it for PBKDF2
 - pbkdf2
 - SHA512
