<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\InvitationController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::post('/invitations', [\App\Http\Controllers\InvitationController::class, 'store'])->name('invitations.store');
    Route::delete('/invitations/{invitation}', [\App\Http\Controllers\InvitationController::class, 'destroy'])->name('invitations.destroy');
});

Route::get('/invitations/{token}', [\App\Http\Controllers\InvitationController::class, 'accept'])->name('invitations.accept');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('tasks', \App\Http\Controllers\TaskController::class);
    Route::post('tasks/{task}/update-status', [\App\Http\Controllers\TaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::resource('settings/workflows', \App\Http\Controllers\WorkflowController::class);
    Route::resource('activities', \App\Http\Controllers\ActivityController::class)->only(['store', 'destroy']);
    Route::resource('leads', \App\Http\Controllers\LeadController::class);
    Route::post('leads/{lead}/convert', [\App\Http\Controllers\LeadController::class, 'convert'])->name('leads.convert');
    Route::post('leads/{lead}/update-status', [\App\Http\Controllers\LeadController::class, 'updateStatus'])->name('leads.update-status');

    // Sales & Revenue
    Route::resource('quotes', \App\Http\Controllers\QuoteController::class);
    Route::resource('invoices', \App\Http\Controllers\InvoiceController::class);

    // Service & Support
    Route::resource('tickets', \App\Http\Controllers\TicketController::class);
});

require __DIR__ . '/crm.php';
require __DIR__ . '/settings.php';


