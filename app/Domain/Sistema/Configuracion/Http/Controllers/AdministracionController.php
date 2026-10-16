<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdministracionController extends Controller
{
    /**
     * Vista principal
     */
    public function index()
    {
        return Inertia::render('sistema/administracion/index');
    }

    /**
     * Consola SQL (la que ya usas)
     */
    public function executeSql(Request $request)
    {
        $request->validate([
            'sql' => ['required', 'string'],
        ]);

        $sql = trim($request->sql);

        try {

            if (preg_match('/^\s*select/i', $sql)) {

                $rows = DB::connection('sqlsrv')->select($sql);

                // detectar tabla simple
                $editableTable = null;

                if (
                    preg_match(
                        '/^\s*select\s+\*\s+from\s+([a-zA-Z0-9_\[\]\.]+)/i',
                        $sql,
                        $m
                    )
                ) {
                    $editableTable = str_replace(['[', ']'], '', $m[1]);
                }

                return response()->json([
                    'type' => 'select',
                    'rows' => $rows,
                    'editable_table' => $editableTable,
                ]);
            }


            $affected = DB::connection('sqlsrv')->affectingStatement($sql);

            return response()->json([
                'type' => 'statement',
                'affected' => $affected,
            ]);
        } catch (\Throwable $e) {

            return response()->json([
                'type' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Devuelve todas las tablas de la base de datos
     */
    public function tablas()
    {
        $tablas = DB::connection('sqlsrv')->select("
            select
                TABLE_SCHEMA + '.' + TABLE_NAME as nombre
            from INFORMATION_SCHEMA.TABLES
            where TABLE_TYPE = 'BASE TABLE'
            order by TABLE_SCHEMA, TABLE_NAME
        ");

        return response()->json(
            collect($tablas)->pluck('nombre')->values()
        );
    }

    /**
     * Devuelve columnas de una tabla
     */
    public function columnas(Request $request)
    {
        $request->validate([
            'tabla' => 'required|string',
        ]);

        $tabla = $request->tabla;

        if (!$this->tablaExiste($tabla)) {
            abort(404, 'Tabla no encontrada');
        }

        [$schema, $table] = explode('.', $tabla, 2);

        $cols = DB::connection('sqlsrv')->select(
            "
            select
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE
            from INFORMATION_SCHEMA.COLUMNS
            where TABLE_SCHEMA = ?
              and TABLE_NAME = ?
            order by ORDINAL_POSITION
            ",
            [$schema, $table]
        );

        return response()->json($cols);
    }

    /**
     * Listado dinámico de registros con paginación y filtro
     */
    public function registros(Request $request)
    {
        $request->validate([
            'tabla' => 'required|string',
            'page' => 'nullable|integer',
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
            'id' => 'nullable'
        ]);

        $tabla = $request->tabla;

        if (!$this->tablaExiste($tabla)) {
            abort(404, 'Tabla no encontrada');
        }

        [$schema, $table] = explode('.', $tabla, 2);

        $perPage = min((int)($request->per_page ?? 10), 100);
        $page    = max((int)($request->page ?? 1), 1);
        $search  = trim((string)$request->search);
        $id      = $request->input('id');

        $columns = DB::connection('sqlsrv')->select(
            "
        select COLUMN_NAME, DATA_TYPE
        from INFORMATION_SCHEMA.COLUMNS
        where TABLE_SCHEMA = ?
          and TABLE_NAME = ?
        ",
            [$schema, $table]
        );

        $baseTable = "[{$schema}].[{$table}]";

        // -------------------------
        // WHERE independientes
        // -------------------------
        $whereParts = [];
        $bindings   = [];

        // -------------------------
        // filtro por ID (AND)
        // -------------------------
        if ($id !== null && $id !== '') {

            $tieneId = collect($columns)
                ->contains(fn($c) => strtolower($c->COLUMN_NAME) === 'id');

            if ($tieneId) {
                $whereParts[] = "[id] = ?";
                $bindings[]   = $id;
            }
        }

        // -------------------------
        // filtro texto (OR internos)
        // -------------------------
        $textParts = [];

        if ($search !== '') {

            foreach ($columns as $col) {

                if (in_array(
                    strtolower($col->DATA_TYPE),
                    ['varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext']
                )) {
                    $textParts[] = "[{$col->COLUMN_NAME}] like ?";
                    $bindings[]  = "%{$search}%";
                }
            }

            if (!empty($textParts)) {
                $whereParts[] = '(' . implode(' OR ', $textParts) . ')';
            }
        }

        // -------------------------
        // armado final
        // -------------------------
        $whereSql = $whereParts
            ? ' WHERE ' . implode(' AND ', $whereParts)
            : '';

        $offset = ($page - 1) * $perPage;

        $total = DB::connection('sqlsrv')->selectOne(
            "SELECT COUNT(*) AS total FROM {$baseTable} {$whereSql}",
            $bindings
        )->total;

        $rows = DB::connection('sqlsrv')->select(
            "
        SELECT *
        FROM {$baseTable}
        {$whereSql}
        ORDER BY (SELECT NULL)
        OFFSET {$offset} ROWS FETCH NEXT {$perPage} ROWS ONLY
        ",
            $bindings
        );

        return response()->json([
            'data' => $rows,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
            'last_page' => (int) ceil($total / $perPage),
        ]);
    }

    /**
     * Verifica que una tabla exista realmente en SQL Server
     */
    private function tablaExiste(string $tabla): bool
    {
        if (!str_contains($tabla, '.')) {
            return false;
        }

        [$schema, $table] = explode('.', $tabla, 2);

        $existe = DB::connection('sqlsrv')->selectOne(
            "
            select count(*) as total
            from INFORMATION_SCHEMA.TABLES
            where TABLE_SCHEMA = ?
              and TABLE_NAME = ?
            ",
            [$schema, $table]
        );

        return ((int)$existe->total) > 0;
    }



    public function updateCell(Request $request)
    {
        $request->validate([
            'tabla'  => 'required|string',
            'id'     => 'required',
            'column' => 'required|string',
            'value'  => 'nullable',
        ]);

        $tabla  = $request->tabla;
        $id     = $request->id;
        $column = $request->column;
        $value  = $request->value;

        // Si viene sin schema, usar dbo por defecto
        if (!str_contains($tabla, '.')) {
            $tabla = 'dbo.' . $tabla;
        }

        // convertir string vacío a null
        if ($value === '') {
            $value = null;
        }

        // validar tabla
        if (!$this->tablaExiste($tabla)) {
            abort(404, 'Tabla no encontrada');
        }

        [$schema, $table] = explode('.', $tabla, 2);

        // validar columna
        $existeColumna = DB::connection('sqlsrv')->selectOne(
            "
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
        ",
            [$schema, $table, $column]
        );

        if ((int)$existeColumna->total === 0) {
            return response()->json([
                'message' => 'Columna inválida'
            ], 422);
        }

        // validar columna id
        $existeId = DB::connection('sqlsrv')->selectOne(
            "
        SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND LOWER(COLUMN_NAME) = 'id'
        ",
            [$schema, $table]
        );

        if ((int)$existeId->total === 0) {
            return response()->json([
                'message' => 'La tabla no tiene columna id'
            ], 422);
        }

        $baseTable = "[{$schema}].[{$table}]";
        $col       = str_replace(']', ']]', $column);

        DB::connection('sqlsrv')->update(
            "UPDATE {$baseTable} SET [{$col}] = ? WHERE [id] = ?",
            [$value, $id]
        );

        return response()->json([
            'ok' => true
        ]);
    }
}
