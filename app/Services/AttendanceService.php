<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class AttendanceService
{
    public function __construct(
        private readonly GeofenceService $geofenceService,
        private readonly FaceService $faceService,
    ) {}

    public function record(
        User $user,
        Event $event,
        UploadedFile $liveCameraFrame,
        float $latitude,
        float $longitude,
        ?float $locationAccuracy,
        bool $livenessPassed,
        ?string $attendanceUuid = null,
        Carbon|string|null $attendanceTime = null,
        string $source = 'web',
        bool $isOfflineSync = false,
    ): Attendance {
        $student = $user->student;

        if (!$user->isStudent() || !$student) {
            throw new AttendanceException('STUDENT_REQUIRED', 'A student account is required.', 403);
        }

        if ($student->verification_status !== 'verified' || !$student->face_embedding) {
            throw new AttendanceException(
                'BIOMETRICS_NOT_VERIFIED',
                'Your face biometrics are not registered or verified yet.',
                422
            );
        }

        if (!$livenessPassed) {
            throw new AttendanceException(
                'LIVENESS_FAILED',
                'Liveness verification must be completed before attendance.',
                422
            );
        }

        $attendanceAt = $attendanceTime
            ? Carbon::parse($attendanceTime)->setTimezone(config('app.timezone'))
            : now();

        $this->assertEventWindow($event, $attendanceAt, $isOfflineSync);

        $geofence = $this->verifyGeofence(
            $event,
            $latitude,
            $longitude,
            $locationAccuracy,
        );

        $uuid = $attendanceUuid ?: (string) Str::uuid();

        $existingByUuid = Attendance::where('attendance_uuid', $uuid)->first();
        if ($existingByUuid) {
            return $existingByUuid;
        }

        if (Attendance::where('student_id', $student->student_id)
            ->where('event_id', $event->event_id)
            ->exists()) {
            throw new AttendanceException(
                'ALREADY_CHECKED_IN',
                'You have already checked in for this event.',
                409
            );
        }

        try {
            $scannedEmbedding = $this->faceService->extractEmbeddingFromUploadedFile($liveCameraFrame);
        } catch (RuntimeException $e) {
            throw new AttendanceException('FACE_SCAN_FAILED', $e->getMessage(), 422);
        }

        $similarity = $this->faceService->cosineSimilarity(
            $scannedEmbedding,
            $student->face_embedding,
        );

        if ($similarity < config('services.face.match_threshold', 0.60)) {
            throw new AttendanceException(
                'FACE_MISMATCH',
                'Face verification failed. Scanned face does not match your profile.',
                422,
                ['confidence_score' => round($similarity, 4)]
            );
        }

        $status = $this->statusFor($event, $attendanceAt);

        return DB::transaction(function () use (
            $student,
            $event,
            $uuid,
            $attendanceAt,
            $status,
            $similarity,
            $latitude,
            $longitude,
            $locationAccuracy,
            $geofence,
            $source,
            $livenessPassed,
            $isOfflineSync,
        ) {
            return Attendance::create([
                'attendance_uuid' => $uuid,
                'student_id' => $student->student_id,
                'event_id' => $event->event_id,
                'logged_at' => $attendanceAt,
                'attendance_time' => $attendanceAt,
                'sync_time' => now(),
                'status' => $status,
                'sync_status' => $isOfflineSync ? 'synced' : 'online',
                'source' => $source,
                'confidence_score' => round($similarity, 4),
                'liveness_passed' => $livenessPassed,
                'liveness_method' => 'mediapipe_blink_turn_smile',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'location_accuracy' => $locationAccuracy,
                'distance_from_event' => $geofence['distance'],
                'location_verified_at' => $attendanceAt,
            ]);
        });
    }

    private function verifyGeofence(
        Event $event,
        float $latitude,
        float $longitude,
        ?float $locationAccuracy,
    ): array {
        if (!$event->geofence_enabled) {
            return ['inside' => true, 'distance' => null, 'radius' => null];
        }

        if ($event->latitude === null || $event->longitude === null) {
            throw new AttendanceException(
                'INVALID_GEOFENCE',
                'This event has an invalid geofence configuration.',
                422
            );
        }

        $maxAccuracy = (float) config('services.geofence.max_accuracy_meters', 100);
        if ($locationAccuracy !== null && $locationAccuracy > $maxAccuracy) {
            throw new AttendanceException(
                'GPS_ACCURACY_TOO_LOW',
                "GPS accuracy is too low (±".round($locationAccuracy)." m). Please try again in an open area.",
                422,
                ['accuracy_meters' => $locationAccuracy, 'max_accuracy_meters' => $maxAccuracy]
            );
        }

        $result = $this->geofenceService->check(
            $latitude,
            $longitude,
            (float) $event->latitude,
            (float) $event->longitude,
            (float) $event->geofence_radius,
        );

        if (!$result['inside']) {
            throw new AttendanceException(
                'OUTSIDE_GEOFENCE',
                'You are outside the allowed attendance area.',
                422,
                [
                    'distance_meters' => $result['distance'],
                    'allowed_radius_meters' => $result['radius'],
                ]
            );
        }

        return $result;
    }

    private function assertEventWindow(Event $event, Carbon $attendanceAt, bool $isOfflineSync): void
    {
        if (!$isOfflineSync && !$event->is_active) {
            throw new AttendanceException(
                'EVENT_NOT_ACTIVE',
                'Attendance check-in for this event is currently closed.',
                422
            );
        }

        $start = Carbon::parse(
            $event->event_date->format('Y-m-d').' '.$event->start_time,
            config('app.timezone')
        );

        $end = $event->end_time
            ? Carbon::parse(
                $event->event_date->format('Y-m-d').' '.$event->end_time,
                config('app.timezone')
            )
            : Carbon::parse($event->event_date->format('Y-m-d').' 23:59:59', config('app.timezone'));

        if ($attendanceAt->lt($start)) {
            throw new AttendanceException('EVENT_NOT_STARTED', 'The attendance window has not started yet.', 422);
        }

        if ($attendanceAt->gt($end)) {
            throw new AttendanceException('EVENT_ENDED', 'The attendance window has already ended.', 422);
        }
    }

    private function statusFor(Event $event, Carbon $attendanceAt): string
    {
        $start = Carbon::parse(
            $event->event_date->format('Y-m-d').' '.$event->start_time,
            config('app.timezone')
        );

        $lateAt = $start->copy()->addMinutes((int) ($event->late_after_minutes ?? 15));

        return $attendanceAt->gt($lateAt) ? 'late' : 'present';
    }
}
