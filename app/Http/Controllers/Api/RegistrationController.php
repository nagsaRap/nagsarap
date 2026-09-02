<?php

namespace App\Http\Controllers\Api;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\FaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class RegistrationController extends Controller
{
    public function register(Request $request, CreateNewUser $creator): JsonResponse
    {
        $user = $creator->create($request->all());
        $token = $user->createToken($request->input('device_name', 'Flutter Device'), ['student'])->plainTextToken;

        return response()->json([
            'success' => true,
            'code' => 'REGISTRATION_CREATED',
            'message' => 'Registration created. Complete live face verification.',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user->load('student'),
            ],
        ], 201);
    }

    public function verifyFace(Request $request, FaceService $faceService): JsonResponse
    {
        $validated = $request->validate([
            'live_camera_frame' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5048'],
            'liveness_passed' => ['required', 'accepted'],
        ]);

        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['success' => false, 'code' => 'STUDENT_NOT_FOUND', 'message' => 'Student record not found.'], 404);
        }

        try {
            $liveEmbedding = $faceService->extractEmbeddingFromUploadedFile($request->file('live_camera_frame'));

            if ($student->face_photo_path && Storage::disk('private')->exists($student->face_photo_path)) {
                $profileEmbedding = $faceService->extractEmbeddingFromBytes(
                    Storage::disk('private')->get($student->face_photo_path)
                );
                $similarity = $faceService->cosineSimilarity($liveEmbedding, $profileEmbedding);

                if ($similarity < config('services.face.enrollment_threshold', 0.50)) {
                    return response()->json([
                        'success' => false,
                        'code' => 'FACE_MISMATCH',
                        'message' => 'Live face does not match the uploaded profile photo.',
                    ], 422);
                }
            }
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'code' => 'FACE_SCAN_FAILED',
                'message' => $e->getMessage(),
            ], 422);
        }

        foreach (Student::whereNotNull('face_embedding')->where('student_id', '!=', $student->student_id)->get() as $other) {
            if ($faceService->cosineSimilarity($liveEmbedding, $other->face_embedding) >= config('services.face.match_threshold', 0.60)) {
                return response()->json([
                    'success' => false,
                    'code' => 'DUPLICATE_FACE',
                    'message' => 'This face is already registered to another student.',
                ], 409);
            }
        }

        $student->update([
            'face_embedding' => $liveEmbedding,
            'verification_status' => 'verified',
        ]);

        return response()->json([
            'success' => true,
            'code' => 'BIOMETRICS_VERIFIED',
            'message' => 'Biometric verification completed.',
            'data' => $student->fresh(),
        ]);
    }
}
