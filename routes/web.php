<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FaceVerificationController;
use App\Models\Event;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // Redirect admins attempting to hit the default /dashboard route
    Route::get('/dashboard', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Redirect admin users directly to their dedicated dashboard
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        $student = $user->load(['student.attendances.event'])->student;

        // Redirect unverified students back to live webcam verification
        if ($student && $student->verification_status === 'pending_face_verification') {
            return redirect()->route('register.verify-face');
        }

        if ($student) {
            $student->face_photo_url = $student->face_photo_path 
                ? route('student.face-photo', ['student' => $student->student_id])
                : null;
        }

        // Active events for webcam scanner dropdown
        $activeEvents = Event::where('is_active', true)->get();

        return Inertia::render('dashboard', [
            'student' => $student,
            'activeEvents' => $activeEvents,
        ]);
    })->name('dashboard');

    // =========================================================================
    // ADMIN ROUTES (Protected by 'admin' Middleware)
    // =========================================================================
    Route::middleware(['admin'])->prefix('admin')->as('admin.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('admin/admindashboard', [
                'totalStudents' => Student::count(),
                'activeEvents' => Event::where('is_active', true)->count(),
            ]);
        })->name('dashboard');
    });

    // =========================================================================
    // BIOMETRIC FACE VERIFICATION (STEP 2 OF REGISTRATION)
    // =========================================================================
    Route::get('/register/verify-face', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $student = $user->load('student')->student;

        // Skip straight to dashboard if already fully verified
        if ($student && $student->verification_status === 'verified') {
            return redirect()->route('dashboard');
        }

        if ($student) {
            $student->face_photo_url = $student->face_photo_path 
                ? route('student.face-photo', ['student' => $student->student_id])
                : null;
        }

        return Inertia::render('auth/verify-face', [
            'student' => $student,
        ]);
    })->name('register.verify-face');

    Route::post('/register/verify-face', [FaceVerificationController::class, 'verifyFace'])
        ->name('register.verify-face.submit');

    Route::post('/attendance/check-in', [AttendanceController::class, 'markAttendance'])
        ->name('attendance.check-in');

    // =========================================================================
    // EVENT MANAGEMENT
    // =========================================================================
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::patch('/events/{event}/toggle', [EventController::class, 'toggleActive'])->name('events.toggle');

    // =========================================================================
    // SECURE PRIVATE STORAGE ACCESS
    // =========================================================================
    Route::get('/student/{student:student_id}/face-photo', function (Student $student) {
        if (!$student->face_photo_path) {
            abort(404);
        }

        $relativePath = ltrim(str_replace(['/storage/', 'storage/'], '', $student->face_photo_path), '/');

        if (!Storage::disk('private')->exists($relativePath)) {
            abort(404);
        }

        return Storage::disk('private')->response($relativePath);
    })->name('student.face-photo');
});

require __DIR__.'/settings.php';