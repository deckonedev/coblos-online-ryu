<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CandidateController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\VoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/candidates', [CandidateController::class, 'index']);
Route::get('/stats', [StatsController::class, 'index']);

// Rate-limited sensitive routes (generous limit for proxy/tunnel users: 1000 per minute)
Route::middleware('throttle:1000,1')->group(function () {
    Route::post('/login/admin', [AuthController::class, 'adminLogin']);
    Route::post('/login/voter', [AuthController::class, 'voterLogin']);
    Route::post('/votes', [VoteController::class, 'store']);
});

// Admin Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Token Management
    Route::get('/tokens', [TokenController::class, 'index']);
    Route::post('/tokens', [TokenController::class, 'store']);
    Route::post('/tokens/restore', [TokenController::class, 'restore']);
    Route::delete('/tokens/clear-all', [TokenController::class, 'destroyAll']);
    Route::delete('/tokens/{id}', [TokenController::class, 'destroy']);

    // Candidate Management (CRUD)
    Route::post('/candidates', [CandidateController::class, 'store']);
    Route::post('/candidates/{id}/update', [CandidateController::class, 'update']);
    Route::delete('/candidates/{id}', [CandidateController::class, 'destroy']);
});
