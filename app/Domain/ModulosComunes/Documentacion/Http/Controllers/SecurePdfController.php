<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Controllers;

use App\Domain\ModulosComunes\Documentacion\Models\VersionDocumento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use setasign\Fpdi\Fpdi;
use App\Http\Controllers\Controller;

class SecurePdfController extends Controller
{
    public function viewer($filename)
    {
        // Buscar la versión por el nombre del archivo
        $version = VersionDocumento::where('archivo_pdf_url', 'like', '%' . $filename . '%')->first();

        if (!$version) {
            abort(404, 'Documento no encontrado');
        }

        // Usar la misma lógica del método view()
        return $this->view($version->id);
    }

public function download($filename)
{
    // Buscar la versión por el nombre del archivo
    $version = VersionDocumento::where('archivo_pdf_url', 'like', '%' . $filename . '%')->first();
    
    if (!$version) {
        abort(404, 'Documento no encontrado');
    }
    
    // Usar la misma lógica del método download()
    return $this->downloadFile($version->id);
}

    private function getPdfPath($url)
    {
        // Convierte URL relativa a path absoluto
        $relativePath = str_replace('/storage/', '', $url);
        return storage_path('app/public/' . $relativePath);
    }

    private function servePdfWithWatermark($pdfPath, $options)
    {
        try {
            // Crear instancia FPDI
            $pdf = new Fpdi();

            // Configurar márgenes y página
            $pdf->SetAutoPageBreak(false);
            $pdf->SetMargins(0, 0, 0);

            // Obtener número de páginas del PDF original
            $pageCount = $pdf->setSourceFile($pdfPath);

            // Procesar cada página
            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                // Importar página
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId);

                // Añadir página
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);

                // Usar la página importada como template
                $pdf->useTemplate($templateId);

                // Añadir marca de agua según el tipo
                $this->addWatermark($pdf, $size, $options, $pageNo);
            }

            // Devolver PDF
            $output = $pdf->Output('S'); // 'S' retorna como string

            return response($output, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => $options['type'] === 'download'
                    ? 'attachment; filename="' . ($options['filename'] ?? 'document.pdf') . '"'
                    : 'inline'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error procesando PDF: ' . $e->getMessage());

            // Fallback: servir el PDF original si hay error
            return response()->file($pdfPath);
        }
    }

    private function addWatermark($pdf, $size, $options, $pageNumber)
    {
        // Configurar fuente y color
        $pdf->SetFont('Helvetica', '', 10);

        if ($options['type'] === 'light') {
            // Marca de agua ligera para vista previa
            $pdf->SetTextColor(220, 220, 220); // Gris muy claro
            $this->addDiagonalWatermark($pdf, $size, $options['text']);
        } else {
            // Marca de agua completa para descarga
            $pdf->SetTextColor(180, 180, 180); // Gris medio

            // Marca diagonal principal
            $this->addDiagonalWatermark($pdf, $size, $options['text']);

            // Encabezado en cada página
            $pdf->SetFont('Helvetica', 'B', 8);
            $pdf->SetTextColor(150, 150, 150);
            $pdf->SetXY(10, 10);
            $pdf->Cell(0, 0, 'COPIA CONTROLADA - ' . Auth::user()->name);

            // Pie de página
            $pdf->SetXY(10, $size['height'] - 15);
            $pdf->Cell(0, 0, 'Página ' . $pageNumber . ' - ' . now()->format('d/m/Y H:i') . ' - Documento interno confidencial');
        }
    }

    private function addDiagonalWatermark($pdf, $size, $text)
    {
        // Configurar para marca de agua diagonal
        $pdf->SetFont('Helvetica', 'B', 20);

        // Calcular posición
        $x = $size['width'] / 2;
        $y = $size['height'] / 2;

        // Guardar estado actual
        $pdf->StartTransform();

        // Rotar 45 grados
        $pdf->Rotate(45, $x, $y);

        // Escribir texto (repetirlo varias veces para cubrir toda la página)
        for ($i = -2; $i <= 2; $i++) {
            for ($j = -2; $j <= 2; $j++) {
                $pdf->SetXY($x + ($i * 150), $y + ($j * 100));
                $pdf->Cell(0, 0, $text, 0, 0, 'C');
            }
        }

        // Restaurar estado
        $pdf->StopTransform();
    }

    private function logAccess($version, $action)
    {
        \App\Domain\ModulosComunes\Documentacion\Models\DocumentAuditLog::create([
            'user_id' => Auth::id(),
            'version_documento_id' => $version->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        \Log::info("Documento {$action}", [
            'user' => Auth::user()->name,
            'documento' => $version->documento->codigo,
            'version' => $version->numero_version
        ]);
    }
}
