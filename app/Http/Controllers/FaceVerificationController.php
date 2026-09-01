<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class FaceVerificationController extends Controller
{
    /**
     * Process live camera biometrics and store 512-D InsightFace embedding.
     */
    public function verifyFace(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return back()->withErrors(['face' => 'Student record not found.']);
        }

        // 1. Validate only the live camera frame file upload
        $request->validate([
            'live_camera_frame' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5048'],
        ]);

        // 2. Convert uploaded camera frame file to Base64
        $liveFrameFile = $request->file('live_camera_frame');
        $liveBase64Image = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($liveFrameFile->getRealPath()));

        // 3. Request Live Frame 512-D Embedding Vector from Python Microservice
        try {
            $response = Http::timeout(10)->post('http://127.0.0.1:5000/extract-embedding', [
                'image_base64' => $liveBase64Image,
            ]);

            if ($response->failed()) {
                return back()->withErrors([
                    'face' => $response->json()['detail'] ?? 'Live biometric validation failed. Please ensure your face is clear and visible.'
                ]);
            }

            $liveEmbedding = $response->json()['embedding'];

        } catch (\Exception $e) {
            return back()->withErrors([
                'face' => 'Unable to connect to biometric verification service.'
            ]);
        }

        // 4. Verify Live Camera against Uploaded Profile Photo
        if ($student->face_photo_path && Storage::disk('private')->exists($student->face_photo_path)) {
            $photoBytes = Storage::disk('private')->get($student->face_photo_path);
            $profileBase64Image = 'data:image/jpeg;base64,' . base64_encode($photoBytes);

            try {
                $photoResponse = Http::timeout(10)->post('http://127.0.0.1:5000/extract-embedding', [
                    'image_base64' => $profileBase64Image,
                ]);

                if ($photoResponse->successful()) {
                    $profileEmbedding = $photoResponse->json()['embedding'];
                    $photoMatchSimilarity = $this->calculateCosineSimilarity($liveEmbedding, $profileEmbedding);

                    // Must match the uploaded profile picture
                    if ($photoMatchSimilarity < 0.50) {
                        return back()->withErrors([
                            'face' => 'Live face does not match the uploaded profile picture. Please try again with proper lighting.'
                        ]);
                    }
                }
            } catch (\Exception $e) {
                // If profile photo check fails due to poor image quality, allow pipeline to fall back on deduplication
            }
        }

        // 5. Cosine Similarity Deduplication check across all registered students
        $existingStudents = Student::whereNotNull('face_embedding')
            ->where('student_id', '!=', $student->student_id)
            ->get();

        foreach ($existingStudents as $existingStudent) {
            $similarity = $this->calculateCosineSimilarity($liveEmbedding, $existingStudent->face_embedding);

            if ($similarity >= 0.60) {
                return back()->withErrors([
                    'face' => 'Duplicate face detected. This face is already registered under student number: ' . $existingStudent->student_number
                ]);
            }
        }

        // 6. Save Embedding & Update Verification Status
        $student->face_embedding = $liveEmbedding;
        $student->verification_status = 'verified';
        $student->save();

        return redirect()->route('dashboard')->with('success', 'Biometric registration completed successfully!');
    }

    /**
     * Calculate Cosine Similarity between two 512-D vector arrays.
     */
    private function calculateCosineSimilarity(array $vecA, array $vecB): float
    {
        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < count($vecA); $i++) {
            $dotProduct += $vecA[$i] * $vecB[$i];
            $normA += $vecA[$i] ** 2;
            $normB += $vecB[$i] ** 2;
        }

        if ($normA == 0 || $normB == 0) {
            return 0.0;
        }

        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }
}