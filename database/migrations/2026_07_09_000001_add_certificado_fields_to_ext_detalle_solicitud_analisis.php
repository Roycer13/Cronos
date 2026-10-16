<?php

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
        Schema::table('ext_detalle_solicitud_analisis', function (Blueprint $table) {
            if (!Schema::hasColumn('ext_detalle_solicitud_analisis', 'certificado_emitido')) {
                $table->boolean('certificado_emitido')->default(false)->after('observaciones');
            }
            if (!Schema::hasColumn('ext_detalle_solicitud_analisis', 'certificado_emitido_en')) {
                $table->timestamp('certificado_emitido_en')->nullable()->after('certificado_emitido');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ext_detalle_solicitud_analisis', function (Blueprint $table) {
            $table->dropColumn(['certificado_emitido', 'certificado_emitido_en']);
        });
    }
};
