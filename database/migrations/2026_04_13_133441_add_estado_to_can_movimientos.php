<?php

use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $pendiente = Estado::firstOrCreate(['nombre' => 'Pendiente'], ['color' => '#f59e0b']);
        Schema::table('CAN_movimientos', function (Blueprint $table) use ($pendiente) {
            //
            $table->foreignId('estado_id')->default($pendiente->id)->constrained('estados')->after('observaciones');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('CAN_movimientos', function (Blueprint $table) {
               $table->dropForeign(['estado_id']);
            $table->dropColumn('estado_id');
        });
    }
};
