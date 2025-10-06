<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Carrega rotas API
        Route::middleware("api")
            ->prefix("api")
            ->group(base_path("routes/api.php"));

        // Carrega rotas Web
        Route::middleware("web")
            ->group(base_path("routes/web.php"));
    }
}