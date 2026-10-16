<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('old_items', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->nullable();
            $table->foreignId('old_subarea_id')->nullable()->constrained('old_subareas')->nullOnDelete();
            $table->string('descripcion')->nullable();

            // ===== LUNES =====
            $table->boolean('lun_1_o')->default(false);
            $table->boolean('lun_1_l')->default(false);
            $table->boolean('lun_1_d')->default(false);

            $table->boolean('lun_2_o')->default(false);
            $table->boolean('lun_2_l')->default(false);
            $table->boolean('lun_2_d')->default(false);

            $table->boolean('lun_3_o')->default(false);
            $table->boolean('lun_3_l')->default(false);
            $table->boolean('lun_3_d')->default(false);

            // ===== MARTES =====
            $table->boolean('mar_1_o')->default(false);
            $table->boolean('mar_1_l')->default(false);
            $table->boolean('mar_1_d')->default(false);

            $table->boolean('mar_2_o')->default(false);
            $table->boolean('mar_2_l')->default(false);
            $table->boolean('mar_2_d')->default(false);

            $table->boolean('mar_3_o')->default(false);
            $table->boolean('mar_3_l')->default(false);
            $table->boolean('mar_3_d')->default(false);

            // ===== MIERCOLES =====
            $table->boolean('mie_1_o')->default(false);
            $table->boolean('mie_1_l')->default(false);
            $table->boolean('mie_1_d')->default(false);

            $table->boolean('mie_2_o')->default(false);
            $table->boolean('mie_2_l')->default(false);
            $table->boolean('mie_2_d')->default(false);

            $table->boolean('mie_3_o')->default(false);
            $table->boolean('mie_3_l')->default(false);
            $table->boolean('mie_3_d')->default(false);

            // ===== JUEVES =====
            $table->boolean('jue_1_o')->default(false);
            $table->boolean('jue_1_l')->default(false);
            $table->boolean('jue_1_d')->default(false);

            $table->boolean('jue_2_o')->default(false);
            $table->boolean('jue_2_l')->default(false);
            $table->boolean('jue_2_d')->default(false);

            $table->boolean('jue_3_o')->default(false);
            $table->boolean('jue_3_l')->default(false);
            $table->boolean('jue_3_d')->default(false);

            // ===== VIERNES =====
            $table->boolean('vie_1_o')->default(false);
            $table->boolean('vie_1_l')->default(false);
            $table->boolean('vie_1_d')->default(false);

            $table->boolean('vie_2_o')->default(false);
            $table->boolean('vie_2_l')->default(false);
            $table->boolean('vie_2_d')->default(false);

            $table->boolean('vie_3_o')->default(false);
            $table->boolean('vie_3_l')->default(false);
            $table->boolean('vie_3_d')->default(false);

            // ===== SABADO =====
            $table->boolean('sab_1_o')->default(false);
            $table->boolean('sab_1_l')->default(false);
            $table->boolean('sab_1_d')->default(false);

            $table->boolean('sab_2_o')->default(false);
            $table->boolean('sab_2_l')->default(false);
            $table->boolean('sab_2_d')->default(false);

            $table->boolean('sab_3_o')->default(false);
            $table->boolean('sab_3_l')->default(false);
            $table->boolean('sab_3_d')->default(false);

            // ===== DOMINGO =====
            $table->boolean('dom_1_o')->default(false);
            $table->boolean('dom_1_l')->default(false);
            $table->boolean('dom_1_d')->default(false);

            $table->boolean('dom_2_o')->default(false);
            $table->boolean('dom_2_l')->default(false);
            $table->boolean('dom_2_d')->default(false);

            $table->boolean('dom_3_o')->default(false);
            $table->boolean('dom_3_l')->default(false);
            $table->boolean('dom_3_d')->default(false);

            // ===== FRECUENCIAS =====
            $table->boolean('quincenal')->default(false);
            $table->boolean('mensual')->default(false);
            $table->boolean('bimensual')->default(false);
            $table->boolean('trimestral')->default(false);
            $table->boolean('semestral')->default(false);
            $table->boolean('anual')->default(false);


            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('old_items');
    }
};
