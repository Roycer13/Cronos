<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Domain\ModulosComunes\Canastillos\Models\Movimiento;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('CAN_movimientos', function (Blueprint $table) {
            $table->unsignedBigInteger('numero')->nullable()->after('id');
            // No se pone unique porque transferencias comparten el mismo número
        });

        // Asignar números correlativos a los movimientos existentes
        $movimientos = Movimiento::orderBy('id')->get();
        $numero = 1;
        foreach ($movimientos as $mov) {
            $mov->numero = $numero;
            $mov->save();
            $numero++;
        }

        // Ahora que todos tienen número, hacer la columna NOT NULL
        Schema::table('CAN_movimientos', function (Blueprint $table) {
            $table->unsignedBigInteger('numero')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('CAN_movimientos', function (Blueprint $table) {
            $table->dropColumn('numero');
        });
    }
};
