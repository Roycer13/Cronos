<?php
// database/migrations/xxxx_xx_xx_create_ext_microbiologia_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ext_microbiologia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ext_detalle_solicitud_analisis_id')->constrained('ext_detalle_solicitud_analisis');
            $table->string('estado')->nullable(); 
            $table->date('fecha_siembra')->nullable();
            $table->foreignId('ana_sem_id')->nullable()->constrained('users'); // analista siembra
            $table->date('fecha_dia2')->nullable();
            $table->foreignId('ana_dia2_id')->nullable()->constrained('users'); // analista día 2
            $table->integer('aer_mes')->nullable();
            $table->integer('col_tot')->nullable();
            $table->date('fecha_dia5')->nullable();
            $table->foreignId('ana_dia5_id')->nullable()->constrained('users'); // analista día 5
            $table->integer('moh_lev')->nullable();
            $table->integer('aer_mes2')->nullable();
            $table->integer('col_tot2')->nullable();
            $table->integer('moh_lev2')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ext_microbiologia');
    }
};