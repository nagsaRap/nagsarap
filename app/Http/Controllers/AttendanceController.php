<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Services\GeofenceService;

class AttendanceController extends Controller
{
    /**
     * Mark attendance for an active event using
     * geofence + face verification.
     */
    public function markAttendance(
        Request $request,
        GeofenceService $geofenceService
    ) {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $student = $user->student;

        // =====================================================
        // VERIFY STUDENT BIOMETRICS
        // =====================================================

        if (
            !$student ||
            $student->verification_status !== 'verified' ||
            !$student->face_embedding
        ) {
            return back()->withErrors([
                'attendance' =>
                    'Your face biometrics are not registered or verified yet.',
            ]);
        }

        // =====================================================
        // 1. VALIDATE REQUEST
        // =====================================================

        $request->validate([
            'event_id' => [
                'required',
                'exists:events,event_id',
            ],

            'live_camera_frame' => [
                'required',
                'image',
                'mimes:jpeg,png,jpg',
                'max:5048',
            ],

            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'location_accuracy' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10000',
            ],
        ]);

        // =====================================================
        // LOAD EVENT
        // =====================================================

        $event = Event::findOrFail(
            $request->event_id
        );

        // =====================================================
        // 2. CHECK EVENT STATUS
        // =====================================================

        if (!$event->is_active) {
            return back()->withErrors([
                'attendance' =>
                    'Attendance check-in for this event is currently closed.',
            ]);
        }

        // =====================================================
        // 3. GEOFENCE VERIFICATION
        // =====================================================

        if ($event->geofence_enabled) {

            if (
                $event->latitude === null ||
                $event->longitude === null
            ) {
                return back()->withErrors([
                    'attendance' =>
                        'This event has an invalid geofence configuration.',
                ]);
            }

            // Reject very inaccurate GPS
            if (
                $request->location_accuracy !== null &&
                (float) $request->location_accuracy > 100
            ) {
                return back()->withErrors([
                    'attendance' =>
                        'Your GPS accuracy is too low. Please move to an open area and try again.',
                ]);
            }

            $geofenceResult =
                $geofenceService->check(
                    (float) $request->latitude,
                    (float) $request->longitude,

                    (float) $event->latitude,
                    (float) $event->longitude,

                    (float) $event->geofence_radius
                );

            if (
                !$geofenceResult['inside']
            ) {
                return back()->withErrors([
                    'attendance' =>
                        'You are outside the allowed attendance area. ' .
                        'You are approximately ' .
                        round(
                            $geofenceResult[
                                'distance'
                            ]
                        ) .
                        ' meters from the event location. ' .
                        'Allowed radius: ' .
                        $event->geofence_radius .
                        ' meters.',
                ]);
            }

        } else {

            $geofenceResult = [
                'inside' => true,
                'distance' => null,
            ];
        }

        // =====================================================
        // 4. PREVENT DUPLICATE CHECK-IN
        // =====================================================

        $alreadyCheckedIn =
            Attendance::where(
                'student_id',
                $student->student_id
            )
            ->where(
                'event_id',
                $event->event_id
            )
            ->exists();

        if ($alreadyCheckedIn) {
            return back()->withErrors([
                'attendance' =>
                    'You have already checked in for this event.',
            ]);
        }

        // =====================================================
        // 5. CONVERT CAMERA FRAME TO BASE64
        // =====================================================

        $liveFrameFile =
            $request->file(
                'live_camera_frame'
            );

        $base64Image =
            'data:image/jpeg;base64,' .
            base64_encode(
                file_get_contents(
                    $liveFrameFile->getRealPath()
                )
            );

        // =====================================================
        // 6. REQUEST FACE EMBEDDING FROM PYTHON SERVICE
        // =====================================================

        try {

            $response =
                Http::timeout(10)
                    ->post(
                        'http://127.0.0.1:5000/extract-embedding',
                        [
                            'image_base64' =>
                                $base64Image,
                        ]
                    );

            if ($response->failed()) {

                return back()->withErrors([
                    'attendance' =>
                        $response->json(
                            'detail'
                        ) ??
                        'Face scan failed. Ensure proper camera lighting.',
                ]);
            }

            $scannedEmbedding =
                $response->json(
                    'embedding'
                );

            if (
                !is_array(
                    $scannedEmbedding
                )
            ) {
                return back()->withErrors([
                    'attendance' =>
                        'Biometric service returned an invalid face embedding.',
                ]);
            }

        } catch (\Exception $e) {

            return back()->withErrors([
                'attendance' =>
                    'Unable to connect to biometric verification service.',
            ]);
        }

        // =====================================================
        // 7. COMPARE SCANNED FACE WITH STORED FACE
        // =====================================================

        $similarity =
            $this
                ->calculateCosineSimilarity(
                    $scannedEmbedding,
                    $student->face_embedding
                );

        // =====================================================
        // FACE VERIFICATION THRESHOLD
        // =====================================================

        if ($similarity < 0.60) {
            return back()->withErrors([
                'attendance' =>
                    'Face verification failed. Scanned face does not match your profile.',
            ]);
        }

        // =====================================================
        // 8. RECORD ATTENDANCE
        // =====================================================

        Attendance::create([
            'student_id' =>
                $student->student_id,

            'event_id' =>
                $event->event_id,

            'logged_at' =>
                now(),

            'status' =>
                'present',

            'confidence_score' =>
                round(
                    $similarity,
                    4
                ),

            'latitude' =>
                $request->latitude,

            'longitude' =>
                $request->longitude,

            'location_accuracy' =>
                $request->location_accuracy,

            'distance_from_event' =>
                $geofenceResult[
                    'distance'
                ],

            'location_verified_at' =>
                now(),
        ]);

        // =====================================================
        // SUCCESS
        // =====================================================

        return back()->with(
            'success',
            'Attendance marked successfully!'
        );
    }

    /**
     * Calculate cosine similarity between
     * two embedding vectors.
     */
    private function calculateCosineSimilarity(
        array $vecA,
        array $vecB
    ): float {
        // Prevent mismatched vectors
        if (
            count($vecA) !==
            count($vecB)
        ) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for (
            $i = 0;
            $i < count($vecA);
            $i++
        ) {
            $dotProduct +=
                $vecA[$i] *
                $vecB[$i];

            $normA +=
                $vecA[$i] ** 2;

            $normB +=
                $vecB[$i] ** 2;
        }

        if (
            $normA == 0 ||
            $normB == 0
        ) {
            return 0.0;
        }

        return $dotProduct /
            (
                sqrt($normA) *
                sqrt($normB)
            );
    }
}