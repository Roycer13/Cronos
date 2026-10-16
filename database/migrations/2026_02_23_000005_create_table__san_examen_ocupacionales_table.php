<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('san_examen_ocupacionales', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_examen', 50); // 'PRE', 'POST', 'OCUPACIONAL'
            $table->dateTime('fecha_examen');
            $table->foreignId('empleado_id')->constrained('users');
            $table->foreignId('medico_id')->constrained('users');
            $table->foreignId('policlinico_id')->nullable()->constrained('san_policlinicos');

            // Record de servicios
            $table->string('entidad_anterior', 150)->nullable();
            $table->string('ocupacion_anterior', 100)->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable(); 
            $table->unsignedSmallInteger('tiempo_servicio_total')->nullable();
            $table->text('enfermedad_profesional')->nullable();
            $table->text('accidentes_trabajo')->nullable();

            // Antecedentes familiares
            $table->boolean('patologias')->default(false);
            $table->json('patologias_lista')->nullable(); // json array

            // Antecedentes personales
            $table->string('grupo_sanguineo', 5)->nullable();
            $table->text('intervenciones_quirurgicas')->nullable();
            $table->text('patologias_personales')->nullable();
            $table->json('vacunas_tipo_dosis')->nullable();
            $table->json('vacunas_fecha_ultima_dosis')->nullable();

            // Hábitos / deportes
            $table->json('habitos_deportes')->nullable();

            // Examen psicológico
            $table->text('examen_psicologico')->nullable();

            // Historial ginecobstétrico
            $table->string('tipo_menstrual', 50)->nullable();
            $table->string('dismenorrea')->nullable();
            $table->string('menarquia')->nullable();
            $table->string('gesta')->nullable();
            $table->string('numero_hijos')->nullable();

            // Examen físico
            $table->decimal('peso_kg', 5, 2)->nullable();
            $table->decimal('estatura_m', 3, 2)->nullable();
            $table->decimal('temperatura_c', 4, 2)->nullable();
            $table->string('presion_arterial_mmhg', 10)->nullable();
            $table->unsignedSmallInteger('frecuencia_respiratoria_pm')->nullable();
            $table->unsignedSmallInteger('pulso_lpm')->nullable();
            $table->decimal('indice_masa_corporal', 5, 2)->nullable();
            $table->string('imc_estado', 50)->nullable();

            // Segmentario
            $table->text('segmentario_cabeza')->nullable();
            $table->text('segmentario_cara')->nullable();
            $table->text('segmentario_ojos')->nullable();
            $table->text('segmentario_oidos')->nullable();
            $table->text('segmentario_fosas_nasales')->nullable();
            $table->text('segmentario_boca_faringe')->nullable();
            $table->text('segmentario_dientes')->nullable();
            $table->text('segmentario_cuello')->nullable();
            $table->text('segmentario_piel')->nullable();
            $table->text('segmentario_torax')->nullable();
            $table->text('segmentario_corazon')->nullable();
            $table->text('segmentario_pulmones')->nullable();
            $table->text('segmentario_abdomen')->nullable();
            $table->text('segmentario_genitourinario')->nullable();
            $table->text('segmentario_extremidades')->nullable();
            $table->text('segmentario_columna')->nullable();
            $table->text('segmentario_neurologico_mental')->nullable();

            // Transferencia
            $table->boolean('transferencia_requerida')->default(false);
            $table->string('especialidad_derivacion', 100)->nullable();

            // Concepto médico
            $table->string('aptitud_ocupacional', 50)->nullable(); // APTO, NO APTO, etc.
            $table->text('concepto_final_aptitud')->nullable();
            $table->text('recomendaciones')->nullable();

            $table->timestamps();

            // Índices
            $table->index(['empleado_id', 'fecha_examen']);
            $table->index('medico_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('san_examen_ocupacionales');
    }
};
