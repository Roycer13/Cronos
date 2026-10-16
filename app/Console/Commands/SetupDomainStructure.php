<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SetupDomainStructure extends Command
{
    protected $signature = 'make:domain-structure';
    protected $description = 'Genera la estructura completa de dominios y módulos';

    public function handle(): void
    {
        $config = config('domains');

        $domains = $config['plants'] ?? [];
        $commons = $config['commons'] ?? [];
        $system  = $config['system'] ?? [];

        // Crear dominios principales
        foreach ($domains as $domain) {
            $this->createDomain("app/Domain/{$domain}");
        }

        // Crear módulos comunes
        foreach ($commons as $common) {
            $this->createDomain("app/Domain/ModulosComunes/{$common}");
        }

        // Crear módulos del sistema
        foreach ($system as $sys) {
            $this->createDomain("app/Domain/Sistema/{$sys}");
        }

        // Crear carpetas de soporte global
        $this->createSupportFolders();

        $this->info('✅ Estructura de dominios y módulos generada correctamente.');
    }

    protected function createDomain(string $path): void
    {
        // Carpetas internas por dominio
        $folders = [
            '/Http/Controllers',
            '/Http/Requests',
            '/Models',
            '/Services',
            '/Repositories',
            '/Policies',
        ];

        foreach ($folders as $folder) {
            File::ensureDirectoryExists($path . $folder);
        }

        // Crear archivo routes.php si no existe
        $routesFile = $path . '/routes.php';
        if (!File::exists($routesFile)) {
            File::put($routesFile, "<?php\n\nuse Illuminate\Support\Facades\Route;\n\n// Rutas del módulo {$path}\n");
        } else {
            $this->warn("⚠️  {$routesFile} ya existe, se omite.");
        }
    }

    protected function createSupportFolders(): void
    {
        $support = [
            'app/Support/Helpers',
            'app/Support/Enums',
            'app/Support/Traits',
            'app/Support/Constants',
            'app/Support/Utils',
            'app/ViewModels',
            'app/Policies',
            'app/Domain/Shared',
        ];

        foreach ($support as $dir) {
            File::ensureDirectoryExists($dir);
        }
    }

}
