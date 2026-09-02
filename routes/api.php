<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/register', [RegistrationController::class, 'register'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::post('/register/verify-face', [RegistrationController::class, 'verifyFace']);

        Route::get('/events', [EventController::class, 'index']);
        Route::get('/events/{event}', [EventController::class, 'show']);

        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])->middleware('throttle:30,1');
        Route::post('/attendance/sync', [AttendanceController::class, 'sync'])->middleware('throttle:60,1');
        Route::get('/attendance/history', [AttendanceController::class, 'history']);
    });
});
