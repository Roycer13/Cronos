<?php

namespace App\Domain\PlantaLacteos\Models;

use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TratamientoAguaResidual extends Model
{
    use HasFactory;

    protected $table = 'PLL_tratamiento_agua_residual';

    protected $fillable = [
        'user_id',
        'tiempo_analisis',
        'turno',
        'flujometro_aire',
        'flujometro_agua',
        't_nivel',
        'reactor',
        't_balanceo',
        'purgado',
        'observaciones',
    ];

    protected $casts = [
        'tiempo_analisis' => 'datetime',
        'purgado' => 'boolean',
        'flujometro_aire' => 'decimal:5',
        'flujometro_agua' => 'decimal:5',
        't_nivel' => 'decimal:5',
        'reactor' => 'decimal:5',
        't_balanceo' => 'decimal:5',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 🔥 Métodos de ayuda

    public static function getHorariosTurno($turno)
    {
        return $turno === 'mañana'
            ? ['07:00', '10:00', '13:00']
            : ['15:00', '18:00', '21:00'];
    }

    public static function getRegistrosDelDia($fecha)
    {
        return self::whereDate('tiempo_analisis', $fecha)
            ->orderBy('tiempo_analisis')
            ->get()
            ->groupBy('turno');
    }

    public static function existeRegistro($fecha, $turno, $numero)
    {
        $horarios = self::getHorariosTurno($turno);
        if (!isset($horarios[$numero - 1])) {
            return false;
        }

        $hora = $horarios[$numero - 1];
        $tiempo = $fecha . ' ' . $hora . ':00';

        return self::where('tiempo_analisis', $tiempo)
            ->where('turno', $turno)
            ->exists();
    }

    public static function crearRegistrosIniciales($fecha)
    {
        $existentes = self::whereDate('tiempo_analisis', $fecha)->count();
        if ($existentes > 0) {
            return false;
        }

        $registros = [];
        $horarios = [
            'mañana' => ['07:00', '10:00', '13:00'],
            'tarde' => ['15:00', '18:00', '21:00']
        ];

        foreach ($horarios as $turno => $horas) {
            foreach ($horas as $index => $hora) {
                $numero = $index + 1;
                $registros[] = [
                    'turno' => $turno,
                    'tiempo_analisis' => $fecha . ' ' . $hora . ':00',
                    'purgado' => ($numero === 3),
                    'user_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        self::insert($registros);
        return true;
    }

    public static function getNumeroRegistro($tiempoAnalisis, $turno)
    {
        $horarios = self::getHorariosTurno($turno);
        $hora = date('H:i', strtotime($tiempoAnalisis));

        $index = array_search($hora, $horarios);
        return $index !== false ? $index + 1 : null;
    }


}
