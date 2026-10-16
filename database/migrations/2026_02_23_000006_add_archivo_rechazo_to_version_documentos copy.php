<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('fecha_nacimiento')->nullable()->after('email');
            $table->string('sexo', 10)->nullable()->after('fecha_nacimiento');
            $table->string('estado_civil', 20)->nullable()->after('sexo');
            $table->string('seguro_social', 20)->nullable()->after('estado_civil');
            $table->foreignId('policlinico_id')->nullable()->constrained('san_policlinicos')->after('seguro_social');
            $table->date('fecha_ingreso')->nullable()->after('policlinico_id');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['policlinico_id']);
            $table->dropColumn([
                'fecha_nacimiento',
                'sexo',
                'estado_civil',
                'seguro_social',
                'policlinico_id',
                'fecha_ingreso'
            ]);
        });
    }
};
