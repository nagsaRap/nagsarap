<?php

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    
    // STEP 2: Live Face Verification Screen
    Route::get('/register/verify-face', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $student = $user->load('student')->student;

        // If already verified, redirect straight to dashboard
        if ($student && $student->verification_status === 'verified') {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/verify-face', [
            'student' => $student,
        ]);
    })->name('register.verify-face');

    // STEP 2 SUBMIT: Update verification status upon successful webcam match
    Route::post('/register/verify-face', function (Request $request) {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $student = $user->student;

        if ($student) {
            $student->update([
                'verification_status' => 'verified',
            ]);
        }

        return redirect()->route('dashboard');
    })->name('register.verify-face.submit');

    // DASHBOARD ROUTE
    Route::get('dashboard', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $student = $user->load('student')->student;

        // Redirect unverified students back to the live webcam verification screen
        if ($student && $student->verification_status === 'pending_verification') {
            return redirect()->route('register.verify-face');
        }

        // Add the face photo URL if a student record and photo path exist
        if ($student) {
            $student->face_photo_url = $student->face_photo_path 
                ? route('student.face-photo', ['student' => $student->student_id])
                : null;
        }

        return Inertia::render('dashboard', [
            'student' => $student,
        ]);
    })->name('dashboard');

    // Secure route to serve the student's face photo from private storage
    Route::get('/student/{student}/face-photo', function (Student $student) {
        if (!Storage::disk('private')->exists($student->face_photo_path)) {
            abort(404);
        }

        return Storage::disk('private')->response($student->face_photo_path);
    })->name('student.face-photo');
});

require __DIR__.'/settings.php';