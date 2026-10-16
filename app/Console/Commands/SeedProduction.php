<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SeedProduction extends Command
{
    protected $signature = 'seed:production';
    protected $description = 'Run all production seeders';

    public function handle()
    {
        $seeders = [
            'DatabaseSeeder',
            'EstadoSeeder',
            'LacteosSeeder0',
            'LacteosSeeder1',
            'LacteosSeeder2',
            'LacteosSeeder3',
            'LacteosSeeder4',
            'LacteosSeeder5',
            'LacteosSeeder6',
            'LacteosSeeder7',
            'LacteosSeeder8',
            'MantenimientoSeeder0',
            'MantenimientoSeeder00',
            'MantenimientoSeeder000',
            'MantenimientoSeeder1',
            'MantenimientoSeeder2',
            'MantenimientoSeeder3',
            'MantenimientoSeeder4',
            'OrigenesTableSeeder',
            'ProduccionTablasSeeder',
            'DispositivosSeeder'


        ];

        foreach ($seeders as $seeder) {
            $this->info("Running {$seeder}...");
            $this->call('db:seed', ['--class' => $seeder]);
        }

        $this->info('All production seeders completed!');
    }
}
