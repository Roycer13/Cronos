<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EstadoSeeder extends Seeder
{
    public function run(): void
    {
        $estados = [
            // 🌱 Estados generales
            ['nombre' => 'Pendiente', 'descripcion' => 'A la espera de acción o revisión.', 'color' => '#f59e0b'],
            ['nombre' => 'Programado', 'descripcion' => 'Planificado para ejecución.', 'color' => '#3b82f6'],
            ['nombre' => 'Por Aprobar', 'descripcion' => 'Esperando autorización.', 'color' => '#eab308'],
            ['nombre' => 'Aprobado', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],
            ['nombre' => 'Rechazado', 'descripcion' => 'Denegado o no aprobado.', 'color' => '#ef4444'],
            ['nombre' => 'Asignado', 'descripcion' => 'Asignado a un responsable.', 'color' => '#2563eb'],
            ['nombre' => 'En Proceso', 'descripcion' => 'Actualmente en ejecución.', 'color' => '#0ea5e9'],
            ['nombre' => 'En Ejecución', 'descripcion' => 'Acción en curso.', 'color' => '#0284c7'],
            ['nombre' => 'En Pausa', 'descripcion' => 'Temporalmente detenido.', 'color' => '#eab308'],
            ['nombre' => 'Suspendido', 'descripcion' => 'Proceso detenido oficialmente.', 'color' => '#f97316'],
            ['nombre' => 'Cancelado', 'descripcion' => 'Anulado por decisión administrativa.', 'color' => '#ef4444'],
            ['nombre' => 'Finalizado', 'descripcion' => 'Proceso completado.', 'color' => '#22c55e'],
            ['nombre' => 'Completado', 'descripcion' => 'Finalizado con éxito.', 'color' => '#15803d'],
            ['nombre' => 'Liberado', 'descripcion' => 'Autorizado para avanzar.', 'color' => '#10b981'],
            ['nombre' => 'Entregado', 'descripcion' => 'Producto o documento entregado.', 'color' => '#22c55e'],
            ['nombre' => 'Recibido', 'descripcion' => 'Confirmación de recepción.', 'color' => '#14b8a6'],
            ['nombre' => 'Devuelto', 'descripcion' => 'Retornado al origen.', 'color' => '#eab308'],
            ['nombre' => 'Observado', 'descripcion' => 'Presenta observaciones.', 'color' => '#f59e0b'],
            ['nombre' => 'Corregido', 'descripcion' => 'Errores subsanados.', 'color' => '#14b8a6'],
            ['nombre' => 'Revisado', 'descripcion' => 'Validado tras revisión.', 'color' => '#16a34a'],
            ['nombre' => 'Verificado', 'descripcion' => 'Confirmado como correcto.', 'color' => '#15803d'],
            ['nombre' => 'Cerrado', 'descripcion' => 'Caso o proceso cerrado.', 'color' => '#22c55e'],
            ['nombre' => 'Anulado', 'descripcion' => 'Registro invalidado.', 'color' => '#991b1b'],

            // 🏭 PROCESOS DE PLANTA (Para el campo "proceso")
            ['nombre' => 'Vacio Limpio', 'descripcion' => 'Equipo vacío y en estado limpio.', 'color' => '#22c55e'],
            ['nombre' => 'Vacio Sucio', 'descripcion' => 'Equipo vacío pero requiere limpieza.', 'color' => '#f59e0b'],
            ['nombre' => 'Produccion', 'descripcion' => 'En proceso de producción activa.', 'color' => '#3b82f6'],
            ['nombre' => 'En Limpieza', 'descripcion' => 'Equipo en proceso de limpieza.', 'color' => '#0ea5e9'],
            ['nombre' => 'En Mantenimiento', 'descripcion' => 'Equipo en mantenimiento o reparación.', 'color' => '#f97316'],
            ['nombre' => 'Almacenando', 'descripcion' => 'Equipo almacenando producto terminado.', 'color' => '#8b5cf6'],

            // 🥛 ETAPAS DE PRODUCCIÓN (Para el campo "etapa")
            ['nombre' => 'Mezcla', 'descripcion' => 'Etapa de mezcla de ingredientes.', 'color' => '#3b82f6'],
            ['nombre' => 'Pasteurizado', 'descripcion' => 'Proceso de pasteurización.', 'color' => '#ef4444'],
            ['nombre' => 'Inoculacion', 'descripcion' => 'Inoculación de cultivos lácteos.', 'color' => '#10b981'],
            ['nombre' => 'Antes de Corte', 'descripcion' => 'Preparación previa al corte de cuajada.', 'color' => '#eab308'],
            ['nombre' => 'Despues de Corte', 'descripcion' => 'Etapa posterior al corte de cuajada.', 'color' => '#f59e0b'],
            ['nombre' => 'Saborizacion', 'descripcion' => 'Adición de sabores e ingredientes.', 'color' => '#8b5cf6'],
            ['nombre' => 'Envasando', 'descripcion' => 'Proceso de envasado del producto.', 'color' => '#06b6d4'],

            // 🧀 Procesos productivos adicionales
            ['nombre' => 'En Mezcla', 'descripcion' => 'Proceso de mezcla activo.', 'color' => '#3b82f6'],
            ['nombre' => 'Pasteurizando', 'descripcion' => 'Etapa de pasteurización.', 'color' => '#0ea5e9'],
            ['nombre' => 'Inoculando', 'descripcion' => 'Inoculación de cultivo en proceso.', 'color' => '#14b8a6'],
            ['nombre' => 'Saborizando', 'descripcion' => 'Adición de sabor o ingredientes.', 'color' => '#8b5cf6'],
            ['nombre' => 'Cortando', 'descripcion' => 'Etapa de corte de cuajada.', 'color' => '#0ea5e9'],
            ['nombre' => 'Lavando', 'descripcion' => 'Lavado de grano o equipo.', 'color' => '#14b8a6'],
            ['nombre' => 'Sellando', 'descripcion' => 'Cierre de envases.', 'color' => '#2563eb'],
            ['nombre' => 'Etiquetando', 'descripcion' => 'Colocando etiquetas.', 'color' => '#0ea5e9'],
            ['nombre' => 'Limpio', 'descripcion' => 'Área o equipo limpio y disponible.', 'color' => '#22c55e'],
            ['nombre' => 'Sujeto a Limpieza', 'descripcion' => 'Pendiente de limpieza.', 'color' => '#eab308'],
            ['nombre' => 'Terminado', 'descripcion' => 'Producto final listo.', 'color' => '#16a34a'],
            ['nombre' => 'En Maduración', 'descripcion' => 'Etapa de maduración.', 'color' => '#a855f7'],
            ['nombre' => 'Madurado', 'descripcion' => 'Producto madurado listo.', 'color' => '#9333ea'],
            ['nombre' => 'Analizando', 'descripcion' => 'En análisis de laboratorio.', 'color' => '#3b82f6'],
            ['nombre' => 'Liberado Calidad', 'descripcion' => 'Aprobado por control de calidad.', 'color' => '#10b981'],
            ['nombre' => 'Retenido', 'descripcion' => 'Bloqueado para control.', 'color' => '#f59e0b'],
            ['nombre' => 'Cuarentena', 'descripcion' => 'Producto bajo observación.', 'color' => '#f97316'],

            // 🚛 Transporte y Logística
            ['nombre' => 'En Carga', 'descripcion' => 'Cargando producto o material.', 'color' => '#3b82f6'],
            ['nombre' => 'En Descarga', 'descripcion' => 'Descargando producto o material.', 'color' => '#0ea5e9'],
            ['nombre' => 'Despachado', 'descripcion' => 'Salida del punto de origen.', 'color' => '#22c55e'],
            ['nombre' => 'En Tránsito', 'descripcion' => 'En desplazamiento o transporte.', 'color' => '#0284c7'],
            ['nombre' => 'En Ruta', 'descripcion' => 'Transportándose hacia destino.', 'color' => '#2563eb'],
            ['nombre' => 'Arribado', 'descripcion' => 'Llegó al destino final.', 'color' => '#16a34a'],
            ['nombre' => 'Demorado', 'descripcion' => 'Retrasado en tránsito.', 'color' => '#b91c1c'],
            ['nombre' => 'Entregado Parcial', 'descripcion' => 'Entrega incompleta.', 'color' => '#f59e0b'],
            ['nombre' => 'Devuelto a Planta', 'descripcion' => 'Retorno del producto.', 'color' => '#eab308'],

            // 🏭 Almacén e Inventario
            ['nombre' => 'En Almacén', 'descripcion' => 'Disponible en stock.', 'color' => '#22c55e'],
            ['nombre' => 'Contando', 'descripcion' => 'Inventario en proceso.', 'color' => '#3b82f6'],
            ['nombre' => 'Contado', 'descripcion' => 'Inventario verificado.', 'color' => '#14b8a6'],
            ['nombre' => 'Faltante', 'descripcion' => 'Artículo no encontrado.', 'color' => '#ef4444'],
            ['nombre' => 'Sobrante', 'descripcion' => 'Cantidad excedente.', 'color' => '#eab308'],
            ['nombre' => 'Ajustado', 'descripcion' => 'Stock modificado por ajuste.', 'color' => '#0ea5e9'],
            ['nombre' => 'Bloqueado', 'descripcion' => 'Stock bloqueado o reservado.', 'color' => '#7f1d1d'],
            ['nombre' => 'En Revisión', 'descripcion' => 'Stock sujeto a verificación.', 'color' => '#3b82f6'],
            ['nombre' => 'Liberado Almacén', 'descripcion' => 'Material autorizado para salida.', 'color' => '#10b981'],

            // ⚙️ Mantenimiento
            ['nombre' => 'Mantenido', 'descripcion' => 'Equipo mantenido.', 'color' => '#14b8a6'],
            ['nombre' => 'Fuera de Servicio', 'descripcion' => 'Equipo no operativo.', 'color' => '#991b1b'],
            ['nombre' => 'Operativo', 'descripcion' => 'Equipo funcionando correctamente.', 'color' => '#22c55e'],
            ['nombre' => 'No Operativo', 'descripcion' => 'Equipo con falla.', 'color' => '#ef4444'],

            // 🧰 Documentos y Control
            ['nombre' => 'Emitido', 'descripcion' => 'Documento generado.', 'color' => '#22c55e'],
            ['nombre' => 'Enviado', 'descripcion' => 'Documento remitido.', 'color' => '#0284c7'],
            ['nombre' => 'Archivado', 'descripcion' => 'Documento guardado sin vigencia.', 'color' => '#6b7280'],
            ['nombre' => 'Vigente', 'descripcion' => 'Documento activo.', 'color' => '#16a34a'],
            ['nombre' => 'Vencido', 'descripcion' => 'Documento expirado.', 'color' => '#dc2626'],
            ['nombre' => 'Reemplazado', 'descripcion' => 'Sustituido por otro.', 'color' => '#0ea5e9'],

            // 🧑‍🔧 RRHH y Solicitudes
            ['nombre' => 'Activo', 'descripcion' => 'Persona o solicitud activa.', 'color' => '#22c55e'],
            ['nombre' => 'Inactivo', 'descripcion' => 'Temporalmente fuera de actividad.', 'color' => '#64748b'],
            ['nombre' => 'Suspendido Temporalmente', 'descripcion' => 'Empleado suspendido.', 'color' => '#f97316'],
            ['nombre' => 'Reincorporado', 'descripcion' => 'Vuelto a la actividad.', 'color' => '#14b8a6'],
            ['nombre' => 'Aprovada', 'descripcion' => 'Vuelto a la actividad.', 'color' => '#14b8a6'],
            ['nombre' => 'En Elaboracin', 'descripcion' => 'Vuelto a la actividad.', 'color' => '#14b8a6'],
            ['nombre' => 'Rechazada', 'descripcion' => 'Vuelto a la actividad.', 'color' => '#14b8a6'],
            ['nombre' => 'Borrador', 'descripcion' => 'Vuelto a la actividad.', 'color' => '#14b8a6'],
            ['nombre' => 'No Liberado', 'descripcion' => 'No autorizado para avanzar.', 'color' => '#eab308'],
            ['nombre' => 'Aceptado', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],
            ['nombre' => 'Por Capacitar', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],
            ['nombre' => 'Capacitado', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],
            ['nombre' => 'Hisopado', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],
            ['nombre' => 'No Hisopado', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],
            ['nombre' => 'Sembrado', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],
            ['nombre' => 'Autorizado', 'descripcion' => 'Autorizado por responsable.', 'color' => '#22c55e'],

        ];

        // Insertar solo los estados que no existen
        foreach ($estados as $estado) {
            $exists = DB::table('estados')->where('nombre', $estado['nombre'])->exists();

            if (!$exists) {
                DB::table('estados')->insert([
                    'nombre' => $estado['nombre'],
                    'descripcion' => $estado['descripcion'],
                    'color' => $estado['color'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
