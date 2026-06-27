<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApiController;

Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::redirect('/login', '/admin/login')->name('login');
Route::redirect('/register', '/admin/register')->name('register');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // API Routes
    Route::get('/api/db-state', [ApiController::class, 'getDbState']);
    Route::post('/api/sync-departments', [ApiController::class, 'syncDepartments']);
    Route::post('/api/sync-transactions', [ApiController::class, 'syncTransactions']);
    Route::post('/api/sync-water-readings', [ApiController::class, 'syncWaterReadings']);
    Route::post('/api/sync-audit-log', [ApiController::class, 'syncAuditLogs']);
});
