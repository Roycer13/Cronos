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
        Schema::table('InspeccionCasilleros', function (Blueprint $table) {
             $table->string('turno')->nullable()->after('user_id');
            $table->index('turno');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('InspeccionCasilleros', function (Blueprint $table) {
               $table->dropColumn('turno');
        });
    }
};
