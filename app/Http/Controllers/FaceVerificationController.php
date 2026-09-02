<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Services\FaceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class FaceVerificationController extends Controller
{
    public function verifyFace(Request $request, FaceService $faceService)
    {
        $student = Auth::user()?->student;

        if (!$student) {
            return back()->withErrors(['face' => 'Student record not found.']);
        }

        $request->validate([
            'live_camera_frame' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5048'],
            'liveness_passed' => ['required', 'accepted'],
        ]);

        try {
            $liveEmbedding = $faceService->extractEmbeddingFromUploadedFile(
                $request->file('live_camera_frame')
            );
        } catch (RuntimeException $e) {
            return back()->withErrors(['face' => $e->getMessage()]);
        }

        if ($student->face_photo_path && Storage::disk('private')->exists($student->face_photo_path)) {
            try {
                $profileEmbedding = $faceService->extractEmbeddingFromBytes(
                    Storage::disk('private')->get($student->face_photo_path)
                );

                $photoMatchSimilarity = $faceService->cosineSimilarity($liveEmbedding, $profileEmbedding);

                if ($photoMatchSimilarity < config('services.face.enrollment_threshold', 0.50)) {
                    return back()->withErrors([
                        'face' => 'Live face does not match the uploaded profile picture.',
                    ]);
                }
            } catch (RuntimeException $e) {
                return back()->withErrors(['face' => $e->getMessage()]);
            }
        }

        $existingStudents = Student::whereNotNull('face_embedding')
            ->where('student_id', '!=', $student->student_id)
            ->get();

        foreach ($existingStudents as $existingStudent) {
            $similarity = $faceService->cosineSimilarity(
                $liveEmbedding,
                $existingStudent->face_embedding
            );

            if ($similarity >= config('services.face.match_threshold', 0.60)) {
                return back()->withErrors([
                    'face' => 'Duplicate face detected. This face is already registered under student number: '.$existingStudent->student_number,
                ]);
            }
        }

        $student->update([
            'face_embedding' => $liveEmbedding,
            'verification_status' => 'verified',
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Biometric registration completed successfully!');
    }
}
