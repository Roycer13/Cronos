<?php

namespace Tests\Unit;

use App\Domain\PlantaLacteos\Models\ExtTipoMuestra;
use PHPUnit\Framework\TestCase;

class ExtTipoMuestraTest extends TestCase
{
    public function test_get_analysis_flags_from_ranges(): void
    {
        $tipo = new ExtTipoMuestra([
            'min_mes' => '1',
            'max_mes' => null,
            'min_colTot' => null,
            'max_colTot' => '10',
            'min_mohLev' => null,
            'max_mohLev' => null,
        ]);

        $flags = $tipo->getAnalysisFlagsFromRanges();

        $this->assertTrue($flags['mesofilos']);
        $this->assertTrue($flags['coliformes']);
        $this->assertFalse($flags['mohos']);
    }
}
