<?php

namespace BitWasp\Bitcoin\Tests\Script\Interpreter;

use BitWasp\Bitcoin\Bitcoin;
use BitWasp\Bitcoin\Script\ConsensusFactory;
use BitWasp\Bitcoin\Script\Script;
use BitWasp\Bitcoin\Tests\AbstractTestCase;
use BitWasp\Bitcoin\Transaction\TransactionFactory;
use BitWasp\Buffertools\Buffer;
use BitWasp\Buffertools\Exceptions\ParserOutOfRange;

class ConsensusTest
{
    private function loadExternalTestFiles($dir)
    {
        $results = array();
        $basedir = __DIR__ . '/../../Data/bitcoinconsensus_testcases/';
        $fulldir = $basedir . $dir . '/';
        foreach (scandir($fulldir) as $file) {
            if (in_array($file, array('.','..'))) {
                continue;
            }
            $results[] = $fulldir . $file;
        }
        return $results;
    }

    private function loadVectors($dir)
    {
        $vectors = array();
        foreach ($this->loadExternalTestFiles($dir) as $c => $file) {
            $vectors[] = explode("\n", file_get_contents($file));
        }
        return $vectors;
    }

    public function getVectors()
    {
        return array_merge(
            $this->loadVectors('0.10-positive'),
            $this->loadVectors('0.10-negative')
        );
    }

    /**
     * @dataProvider getVectors
     * @param string $scriptPubKey
     * @param string $tx
     * @param int $nInput
     * @param int $flags
     * @param int $result
     */
    public function testCases($scriptPubKey, $tx, $nInput, $flags, $result)
    {
        $result = (bool) $result;
        $scriptPubKey = new Script(Buffer::hex($scriptPubKey));
        try {
            $tx = TransactionFactory::fromHex($tx);
        } catch (ParserOutOfRange $e) {
            $this->assertEquals(false, $result);
            return;
        }

        ob_start();
        $factory = new ConsensusFactory(Bitcoin::getEcAdapter());
        $consensus = $factory->getConsensus($factory->flags($flags));
        $r = $consensus->verify($tx, $scriptPubKey, $nInput);
        $contents = ob_get_contents();
        ob_end_clean();

        if ($r !== $result) {
            $parser = $scriptPubKey->getScriptParser();

            echo "---START---";
            var_dump(
                $scriptPubKey->gethex(),
                $tx->gethex(),
                $nInput,
                $flags,
                (int)$result
            );
            echo $contents . "\n";
            echo $parser->getHumanReadable() . "\n";
            echo "---END---\n";
        } else {
            $this->assertEquals($result, $r);
        }


    }
}
