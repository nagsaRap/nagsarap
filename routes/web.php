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
    Route::get('/register/verify-face', function () {
        $student = Auth::user()->load('student')->student;

        if ($student && $student->verification_status === 'verified') {
            return redirect()->route('dashboard');
        }

        if ($student) {
            $student->face_photo_url = $student->face_photo_path
                ? route('student.face-photo', ['student' => $student->student_id])
                : null;
        }

        return Inertia::render('auth/verify-face', ['student' => $student]);
    })->name('register.verify-face');

    Route::post('/register/verify-face', [FaceVerificationController::class, 'verifyFace'])
        ->name('register.verify-face.submit');

    Route::get('/dashboard', function () {
        $user = Auth::user();
        $student = $user->load(['student.attendances.event'])->student;

        if ($student && $student->verification_status === 'pending_face_verification') {
            return redirect()->route('register.verify-face');
        }

        if ($student) {
            $student->face_photo_url = $student->face_photo_path
                ? route('student.face-photo', ['student' => $student->student_id])
                : null;
        }

        $today = now()->toDateString();
        $activeEvents = Event::where('is_active', true)
            ->whereDate('event_date', $today)
            ->orderBy('start_time')
            ->get();

        $upcomingEvents = Event::whereDate('event_date', '>', $today)
            ->orderBy('event_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'student' => $student,
            'activeEvents' => $activeEvents,
            'upcomingEvents' => $upcomingEvents,
            'totalExpectedEvents' => Event::count(),
        ]);
    })->name('dashboard');

    Route::post('/attendance/check-in', [AttendanceController::class, 'markAttendance'])
        ->name('attendance.check-in');

    Route::middleware('role:admin,organizer')->group(function () {
        Route::get('/events', [EventController::class, 'index'])->name('events.index');
        Route::post('/events', [EventController::class, 'store'])->name('events.store');
        Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');
        Route::patch('/events/{event}/toggle', [EventController::class, 'toggleActive'])->name('events.toggle');
    });

    Route::get('/student/{student:student_id}/face-photo', function (Student $student) {
        abort_unless(Auth::user()->student_id === $student->student_id || Auth::user()->isAdmin(), 403);

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
