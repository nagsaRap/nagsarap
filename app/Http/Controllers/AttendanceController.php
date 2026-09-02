<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\AttendanceException;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function markAttendance(Request $request, AttendanceService $attendanceService)
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,event_id'],
            'live_camera_frame' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5048'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'liveness_passed' => ['required', 'accepted'],
        ]);

        $event = Event::findOrFail($validated['event_id']);

        try {
            $attendanceService->record(
                user: Auth::user(),
                event: $event,
                liveCameraFrame: $request->file('live_camera_frame'),
                latitude: (float) $validated['latitude'],
                longitude: (float) $validated['longitude'],
                locationAccuracy: isset($validated['location_accuracy']) ? (float) $validated['location_accuracy'] : null,
                livenessPassed: true,
                source: 'web',
                isOfflineSync: false,
            );
        } catch (AttendanceException $e) {
            $message = $e->getMessage();
            if ($e->data) {
                $message .= ' '.collect($e->data)->map(fn ($value, $key) => "$key: $value")->implode(', ');
            }

            return back()->withErrors(['attendance' => $message]);
        }

        return back()->with('success', 'Attendance marked successfully!');
    }
}
