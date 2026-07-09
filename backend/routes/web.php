<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SPA Fallback Route
|--------------------------------------------------------------------------
|
| When the React frontend is deployed into public/spa.html (via tunnel_domain.ps1),
| this catch-all route serves the SPA for all non-API routes.
| This enables client-side routing (React Router) to work correctly.
|
*/

Route::get('/{any?}', function () {
    // If SPA is deployed (tunnel mode), serve it
    $spaPath = public_path('spa.html');
    if (file_exists($spaPath)) {
        return response()->file($spaPath, [
            'Content-Type' => 'text/html',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    // Default: serve Laravel welcome page (local dev)
    return view('welcome');
})->where('any', '^(?!api|sanctum|storage|up).*$');
