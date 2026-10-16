<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // $driver = Schema::getConnection()->getDriverName();

        // if ($driver !== 'sqlsrv') {
        //     throw new \RuntimeException('This migration only supports SQL Server (sqlsrv). Current driver: ' . $driver);
        // }

        // DB::statement('ALTER TABLE [PLL_destino_desinfecciones] ALTER COLUMN [concentracion] DECIMAL(8,4) NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // $driver = Schema::getConnection()->getDriverName();

        // if ($driver !== 'sqlsrv') {
        //     throw new \RuntimeException('This migration only supports SQL Server (sqlsrv). Current driver: ' . $driver);
        // }

        // DB::statement('ALTER TABLE [PLL_destino_desinfecciones] ALTER COLUMN [concentracion] DECIMAL(6,2) NOT NULL');
    }
};
