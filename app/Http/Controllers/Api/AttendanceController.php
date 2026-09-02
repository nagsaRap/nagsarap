<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\AttendanceException;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Online attendance check-in.
     */
    public function checkIn(
        Request $request,
        AttendanceService $attendanceService
    ): JsonResponse {
        $validated = $request->validate([
            'event_id' => [
                'required',
                'exists:events,event_id',
            ],

            'live_camera_frame' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png',
                'max:5120',
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

            'liveness_passed' => [
                'required',
                'boolean',
            ],
        ]);

        try {
            $attendance = $attendanceService->record(
                user: $request->user(),

                eventId: (int) $validated['event_id'],

                liveCameraFrame:
                    $request->file('live_camera_frame'),

                latitude:
                    (float) $validated['latitude'],

                longitude:
                    (float) $validated['longitude'],

                locationAccuracy:
                    isset($validated['location_accuracy'])
                        ? (float) $validated['location_accuracy']
                        : null,

                livenessPassed:
                    (bool) $validated['liveness_passed'],

                attendanceTime: now(),

                attendanceUuid: null,

                source: 'mobile',

                syncStatus: 'online'
            );

            return response()->json([
                'success' => true,

                'code' =>
                    'ATTENDANCE_RECORDED',

                'message' =>
                    'Attendance recorded successfully.',

                'data' => [
                    'attendance' =>
                        $attendance,
                ],
            ], 201);

        } catch (AttendanceException $e) {
            return response()->json([
                'success' => false,

                'code' =>
                    $e->errorCode,

                'message' =>
                    $e->getMessage(),

                'data' =>
                    $e->data,
            ], $e->statusCode);

        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,

                'code' =>
                    'ATTENDANCE_FAILED',

                'message' =>
                    'Unable to record attendance.',
            ], 500);
        }
    }

    /**
     * Synchronize attendance that was captured offline.
     */
    public function sync(
        Request $request,
        AttendanceService $attendanceService
    ): JsonResponse {
        $validated = $request->validate([
            'event_id' => [
                'required',
                'exists:events,event_id',
            ],

            'attendance_uuid' => [
                'required',
                'uuid',
            ],

            'attendance_time' => [
                'required',
                'date',
            ],

            'live_camera_frame' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png',
                'max:5120',
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

            'liveness_passed' => [
                'required',
                'boolean',
            ],
        ]);

        /*
         * Idempotency:
         * If this offline record has already been synced,
         * return the existing attendance instead of
         * creating another one.
         */
        $existingAttendance =
            Attendance::where(
                'attendance_uuid',
                $validated['attendance_uuid']
            )->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => true,

                'code' =>
                    'ATTENDANCE_ALREADY_SYNCED',

                'message' =>
                    'This attendance record has already been synchronized.',

                'data' => [
                    'attendance' =>
                        $existingAttendance,
                ],
            ]);
        }

        try {
            $attendance = $attendanceService->record(
                user: $request->user(),

                eventId:
                    (int) $validated['event_id'],

                liveCameraFrame:
                    $request->file(
                        'live_camera_frame'
                    ),

                latitude:
                    (float) $validated['latitude'],

                longitude:
                    (float) $validated['longitude'],

                locationAccuracy:
                    isset(
                        $validated[
                            'location_accuracy'
                        ]
                    )
                        ? (float) $validated[
                            'location_accuracy'
                        ]
                        : null,

                livenessPassed:
                    (bool) $validated[
                        'liveness_passed'
                    ],

                attendanceTime:
                    $validated[
                        'attendance_time'
                    ],

                attendanceUuid:
                    $validated[
                        'attendance_uuid'
                    ],

                source:
                    'mobile',

                syncStatus:
                    'synced'
            );

            return response()->json([
                'success' => true,

                'code' =>
                    'ATTENDANCE_SYNCED',

                'message' =>
                    'Offline attendance synchronized successfully.',

                'data' => [
                    'attendance' =>
                        $attendance,
                ],
            ]);

        } catch (AttendanceException $e) {
            return response()->json([
                'success' => false,

                'code' =>
                    $e->errorCode,

                'message' =>
                    $e->getMessage(),

                'data' =>
                    $e->data,
            ], $e->statusCode);

        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,

                'code' =>
                    'SYNC_FAILED',

                'message' =>
                    'Unable to synchronize attendance.',
            ], 500);
        }
    }

    /**
     * Attendance history for logged-in student.
     */
    public function history(
        Request $request
    ): JsonResponse {
        $user =
            $request->user();

        $student =
            $user->student;

        if (!$student) {
            return response()->json([
                'success' => false,

                'code' =>
                    'STUDENT_REQUIRED',

                'message' =>
                    'A student account is required.',
            ], 403);
        }

        $attendances =
            Attendance::with('event')
                ->where(
                    'student_id',
                    $student->student_id
                )
                ->orderByDesc(
                    'attendance_time'
                )
                ->orderByDesc(
                    'logged_at'
                )
                ->get();

        return response()->json([
            'success' => true,

            'code' =>
                'ATTENDANCE_HISTORY_FETCHED',

            'message' =>
                'Attendance history retrieved successfully.',

            'data' =>
                $attendances,
        ]);
    }
}