<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\AttendanceException;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function checkIn(Request $request, AttendanceService $attendanceService): JsonResponse
    {
        return $this->process($request, $attendanceService, false);
    }

    public function sync(Request $request, AttendanceService $attendanceService): JsonResponse
    {
        return $this->process($request, $attendanceService, true);
    }

    public function history(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        $records = $student->attendances()
            ->with('event')
            ->orderByDesc('attendance_time')
            ->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $records,
        ]);
    }

    private function process(Request $request, AttendanceService $attendanceService, bool $offline): JsonResponse
    {
        $rules = [
            'event_id' => ['required', 'exists:events,event_id'],
            'attendance_uuid' => [$offline ? 'required' : 'nullable', 'uuid'],
            'attendance_time' => [$offline ? 'required' : 'nullable', 'date'],
            'live_camera_frame' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5048'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'liveness_passed' => ['required', 'accepted'],
        ];

        $validated = $request->validate($rules);
        $event = Event::findOrFail($validated['event_id']);

        try {
            $attendance = $attendanceService->record(
                user: $request->user(),
                event: $event,
                liveCameraFrame: $request->file('live_camera_frame'),
                latitude: (float) $validated['latitude'],
                longitude: (float) $validated['longitude'],
                locationAccuracy: isset($validated['location_accuracy']) ? (float) $validated['location_accuracy'] : null,
                livenessPassed: true,
                attendanceUuid: $validated['attendance_uuid'] ?? null,
                attendanceTime: $validated['attendance_time'] ?? null,
                source: $offline ? 'mobile_offline' : 'mobile_online',
                isOfflineSync: $offline,
            );
        } catch (AttendanceException $e) {
            return response()->json([
                'success' => false,
                'code' => $e->errorCode,
                'message' => $e->getMessage(),
                'data' => $e->data,
            ], $e->httpStatus);
        }

        return response()->json([
            'success' => true,
            'code' => $offline ? 'OFFLINE_ATTENDANCE_SYNCED' : 'ATTENDANCE_RECORDED',
            'message' => $offline ? 'Offline attendance synchronized successfully.' : 'Attendance recorded successfully.',
            'data' => [
                'attendance' => $attendance->load('event'),
                'geofence' => [
                    'passed' => true,
                    'distance_meters' => $attendance->distance_from_event,
                    'allowed_radius_meters' => $attendance->event->geofence_radius,
                ],
            ],
        ]);
    }
}
