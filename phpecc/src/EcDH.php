<?php

namespace Mdanter\Ecc;

/**
 * *********************************************************************
 * Copyright (C) 2012 Matyas Danter
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * ***********************************************************************
 */

/**
 * This class is the implementation of ECDH.
 * EcDH is safe key exchange and achieves
 * that a key is transported securely between two parties.
 * The key then can be hashed and used as a basis in
 * a dual encryption scheme, along with AES for faster
 * two- way encryption.
 *
 */
class EcDH implements EcDHInterface
{
    /**
     * Adapter used for math calculatioins
     *
     * @var MathAdapterInterface
     */
    private $adapter;

    /**
     * Secret key between the two parties
     *
     * @var PointInterface
     */
    private $secretKey = null;

    /**
     *
     * @var PublicKeyInterface
     */
    private $recipientKey;

    /**
     *
     * @var PrivateKeyInterface
     */
    private $senderKey;

    /**
     * Initialize a new exchange from a generator point.
     *
     * @param MathAdapterInterface $adapter A math adapter instance.
     */
    public function __construct(MathAdapterInterface $adapter)
    {
        $this->adapter = $adapter;
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::calculateSharedKey()
     */
    public function calculateSharedKey()
    {
        $this->calculateKey();

        return $this->secretKey->getX();
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::createMultiPartyKey()
     */
    public function createMultiPartyKey()
    {
        $this->calculateKey();

        return new PublicKey($this->adapter, $this->senderKey->getPoint(), $this->secretKey);
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::setRecipientKey()
     */
    public function setRecipientKey(PublicKeyInterface $key)
    {
        $this->recipientKey = $key;
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::setSenderKey()
     */
    public function setSenderKey(PrivateKeyInterface $key)
    {
        $this->senderKey = $key;
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::encrypt()
     */
    public function encrypt($string)
    {
        $key = hash("sha256", $this->secretKey->getX(), true);

        $cypherText = mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key, base64_encode($string), MCRYPT_MODE_CBC, $key);

        return $cypherText;
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::decrypt()
     */
    public function decrypt($string)
    {
        $key = hash("sha256", $this->secretKey->getX(), true);

        $clearText = base64_decode(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $key, $string, MCRYPT_MODE_CBC, $key));

        return $clearText;
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::encryptFile()
     */
    public function encryptFile($path)
    {
        if (file_exists($path) && is_readable($path)) {
            return $this->encrypt(file_get_contents($path));
        }

        throw new \InvalidArgumentException("File '$path' does not exist or is not readable.");
    }

    /**
     * {@inheritDoc}
     * @see \Mdanter\Ecc\EcDHInterface::decryptFile()
     */
    public function decryptFile($path)
    {
        if (file_exists($path) && is_readable($path)) {
            return $this->decrypt(file_get_contents($path));
        }

        throw new \InvalidArgumentException("File '$path' does not exist or is not readable.");
    }

    /**
     * @see \Mdanter\Ecc\EcDHInterface::calculateKey()
     */
    private function calculateKey()
    {
        $this->checkExchangeState();

        if ($this->secretKey === null) {
            $pubPoint = $this->recipientKey->getPoint();
            $secret = $this->senderKey->getSecret();

            $this->secretKey = $pubPoint->mul($secret);
        }
    }

    /**
     * Verifies that the shared secret is known, or that the required keys are available
     * to calculate the shared secret.
     * @throws \RuntimeException when the exchange has not been made.
     */
    private function checkExchangeState()
    {
        if ($this->secretKey !== null) {
            return;
        }

        if ($this->senderKey === null) {
            throw new \RuntimeException('Sender key not set.');
        }

        if ($this->recipientKey === null) {
            throw new \RuntimeException('Recipient key not set.');
        }
    }
}
