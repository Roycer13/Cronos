<?php

namespace App\Domain\ModulosComunes\Sanidad\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExamenOcupacionalRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'tipo_examen' => 'required',
            'fecha_examen' => 'required|date',
            'empleado_id' => 'required|exists:users,id',

            'policlinico_id' => 'nullable|exists:san_policlinicos,id',

            // Record de servicios
            'entidad_anterior' => 'nullable|string|max:150',
            'ocupacion_anterior' => 'nullable|string|max:100',
            'enfermedad_profesional' => 'nullable|string',
            'accidentes_trabajo' => 'nullable|string',
            'fecha_inicio' => 'nullable|date_format:Y-m', // Validar formato YYYY-MM
            'fecha_fin' => 'nullable|date_format:Y-m|after_or_equal:fecha_inicio',
            'tiempo_servicio_total' => 'nullable|numeric|min:0|max:100',

            // Antecedentes familiares
            'patologias' => 'boolean',
            'patologias_lista' => 'nullable|string',

            // Antecedentes personales
            'grupo_sanguineo' => 'nullable|string|max:5',
            'intervenciones_quirurgicas' => 'nullable|string',
            'patologias_personales' => 'nullable|string',
            'vacunas_tipo_dosis' => 'nullable|string',
            'vacunas_fecha_ultima_dosis' => 'nullable|string',

            // Hábitos
            'habitos_deportes' => 'nullable|string',

            // Examen psicológico
            'examen_psicologico' => 'nullable|string',

            // Historial ginecobstétrico
            'tipo_menstrual' => 'nullable|string|max:50',
            'dismenorrea' => 'boolean',
            'menarquia' => 'nullable|integer|min:0|max:30',
            'gesta' => 'nullable|integer|min:0',
            'numero_hijos' => 'nullable|integer|min:0',

            // Examen físico
            'peso_kg' => 'nullable|numeric|min:0|max:300',
            'estatura_m' => 'nullable|numeric|min:0|max:3',
            'temperatura_c' => 'nullable|numeric|min:30|max:45',
            'presion_arterial_mmhg' => 'nullable|string|max:10',
            'frecuencia_respiratoria_pm' => 'nullable|integer|min:0|max:100',
            'pulso_lpm' => 'nullable|integer|min:0|max:250',
            'indice_masa_corporal' => 'nullable|numeric|min:0|max:100',
            'imc_estado' => 'nullable|string|max:50',

            // Segmentario
            'segmentario_cabeza' => 'nullable|string',
            'segmentario_cara' => 'nullable|string',
            'segmentario_ojos' => 'nullable|string',
            'segmentario_oidos' => 'nullable|string',
            'segmentario_fosas_nasales' => 'nullable|string',
            'segmentario_boca_faringe' => 'nullable|string',
            'segmentario_dientes' => 'nullable|string',
            'segmentario_cuello' => 'nullable|string',
            'segmentario_piel' => 'nullable|string',
            'segmentario_torax' => 'nullable|string',
            'segmentario_corazon' => 'nullable|string',
            'segmentario_pulmones' => 'nullable|string',
            'segmentario_abdomen' => 'nullable|string',
            'segmentario_genitourinario' => 'nullable|string',
            'segmentario_extremidades' => 'nullable|string',
            'segmentario_columna' => 'nullable|string',
            'segmentario_neurologico_mental' => 'nullable|string',

            // Transferencia
            'transferencia_requerida' => 'boolean',
            'especialidad_derivacion' => 'nullable|required_if:transferencia_requerida,true|string|max:100',

            // Concepto médico
            'aptitud_ocupacional' => 'nullable|string|max:50',
            'concepto_final_aptitud' => 'nullable|string',
            'recomendaciones' => 'nullable|string',
        ];
    }
}
