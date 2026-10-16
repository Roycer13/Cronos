<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Domain\PlantaLacteos\Models\Origen;

$origenes = Origen::all();

foreach ($origenes as $origen) {
    echo "ID: {$origen->id} | Alias: {$origen->alias} | Descripcion: {$origen->descripcion} | Tipo: {$origen->tipo}\n";
}
