<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('PLL_detalle_op_arranque')
            ->where('tipo', 'Empaque')
            ->update(['tipo' => 'OP Empaque']);

        DB::table('PLL_detalle_op_arranque')
            ->where('tipo', 'Bobina')
            ->update(['tipo' => 'OP Bobina']);
    }

    public function down(): void
    {
        DB::table('PLL_detalle_op_arranque')
            ->where('tipo', 'OP Empaque')
            ->update(['tipo' => 'Empaque']);

        DB::table('PLL_detalle_op_arranque')
            ->where('tipo', 'OP Bobina')
            ->update(['tipo' => 'Bobina']);
    }
};
