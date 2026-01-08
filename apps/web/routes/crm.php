<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\DealController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', \App\Http\Middleware\TenantMiddleware::class])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::delete('accounts/bulk-destroy', [AccountController::class, 'bulkDestroy'])->name('accounts.bulk-destroy');
    Route::resource('accounts', AccountController::class);
    Route::resource('contacts', ContactController::class);

    Route::patch('pipelines/{pipeline}/make-default', [PipelineController::class, 'makeDefault'])->name('pipelines.make-default');
    Route::resource('pipelines', PipelineController::class);
    Route::patch('deals/{deal}/update-stage', [DealController::class, 'updateStage'])->name('deals.update-stage');
    Route::resource('deals', DealController::class);

    // Tasks & Notes
    Route::post('tasks', [\App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
    Route::patch('tasks/{task}/status', [\App\Http\Controllers\TaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::delete('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('notes', [\App\Http\Controllers\NoteController::class, 'store'])->name('notes.store');
    Route::delete('notes/{note}', [\App\Http\Controllers\NoteController::class, 'destroy'])->name('notes.destroy');
    Route::post('attachments', [\App\Http\Controllers\AttachmentController::class, 'store'])->name('attachments.store');
    Route::delete('attachments/{attachment}', [\App\Http\Controllers\AttachmentController::class, 'destroy'])->name('attachments.destroy');
});