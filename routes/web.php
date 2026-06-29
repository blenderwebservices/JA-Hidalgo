<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApiController;

Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::redirect('/login', '/admin/login')->name('login');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // API Routes
    Route::get('/api/db-state', [ApiController::class, 'getDbState']);
    Route::post('/api/sync-departments', [ApiController::class, 'syncDepartments']);
    Route::post('/api/sync-transactions', [ApiController::class, 'syncTransactions']);
    Route::post('/api/sync-water-readings', [ApiController::class, 'syncWaterReadings']);
    Route::post('/api/sync-audit-log', [ApiController::class, 'syncAuditLogs']);
    Route::post('/api/sync-expenses', [ApiController::class, 'syncExpenses']);
    Route::post('/api/sync-expense-groups', [ApiController::class, 'syncExpenseGroups']);
    Route::post('/api/sync-expense-subgroups', [ApiController::class, 'syncExpenseSubgroups']);
    Route::post('/api/sync-payment-methods', [ApiController::class, 'syncPaymentMethods']);
    Route::post('/api/sync-notices', [ApiController::class, 'syncNotices']);
});
