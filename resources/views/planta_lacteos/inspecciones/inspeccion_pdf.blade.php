<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 10px; }
        .title { font-size: 16px; font-weight: bold; }
        .meta { margin-top: 6px; font-size: 11px; }
        .section { margin-top: 10px; }
        .section h4 { margin-bottom: 4px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; }
        table th, table td { border: 1px solid #444; padding: 6px; font-size: 11px; }
    </style>
</head>
<body>
<div class="header">
    <div class="title">Inspección de Infraestructura</div>
    <div class="meta">Generado: {{ $fecha_generacion }} - Usuario: {{ $usuario }}</div>
</div>

<div class="section">
    <table>
        <tr>
            <th>ID</th>
            <td>{{ $inspeccion->id }}</td>
            <th>Área</th>
            <td>{{ $inspeccion->infraestructura->nombre ?? '-' }}</td>
        </tr>
        <tr>
            <th>Fecha</th>
            <td>{{ optional($inspeccion->fecha)->format('d/m/Y H:i') }}</td>
            <th>Inspector</th>
            <td>{{ $inspeccion->usuario->name ?? '-' }} {{ $inspeccion->usuario->apellido ?? '' }}</td>
        </tr>
        <tr>
            <th>Observación general</th>
            <td colspan="3">{{ $inspeccion->observacion_general ?? '-' }}</td>
        </tr>
    </table>
</div>

<div class="section">
    <h4>Criterios evaluados</h4>
    <table>
        <thead>
        <tr>
            <th>Criterio</th>
            <th>Estado</th>
            <th>Observación</th>
        </tr>
        </thead>
        <tbody>
        @php
            $criterios = ['pisos','paredes','techos','puertas','ventanas','drenajes','iluminacion','ventilacion','lavamanos','servicios_sanitarios','almacenamiento','senalizacion'];
        @endphp
        @foreach($criterios as $c)
            @if(isset($inspeccion->{$c . '_ok'}))
                <tr>
                    <td>{{ ucwords(str_replace('_',' ',$c)) }}</td>
                    <td>{{ $inspeccion->{$c . '_ok'} ? 'Cumple' : 'No cumple' }}</td>
                    <td>{{ $inspeccion->{$c . '_observacion'} ?? '' }}</td>
                </tr>
            @endif
        @endforeach
        </tbody>
    </table>
</div>

<div class="section">
    <h4>Acciones de seguimiento</h4>
    @if($inspeccion->acciones->isEmpty())
        <p>No hay acciones registradas</p>
    @else
        <table>
            <thead>
            <tr>
                <th>Criterio</th>
                <th>Descripción</th>
                <th>Responsable</th>
                <th>Fecha ejecución</th>
                <th>Estado</th>
            </tr>
            </thead>
            <tbody>
            @foreach($inspeccion->acciones as $accion)
                <tr>
                    <td>{{ $accion->criterio }}</td>
                    <td>{{ $accion->descripcion }}</td>
                    <td>{{ $accion->responsable ?? '-' }}</td>
                    <td>{{ $accion->fecha_ejecucion ? \Carbon\Carbon::parse($accion->fecha_ejecucion)->format('d/m/Y') : '-' }}</td>
                    <td>{{ $accion->estado }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @endif
</div>

</body>
</html>
