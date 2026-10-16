<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('old_distribucion_carros', function (Blueprint $table) {
            $table->decimal('set_temperatura')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('old_distribucion_carros', function (Blueprint $table) {
            $table->decimal('set_temperatura')->nullable(false)->change();
        });
    }
};