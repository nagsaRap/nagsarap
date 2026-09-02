<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Return events available to the authenticated student.
     */
    public function index(Request $request): JsonResponse
    {
        $events = Event::query()
            ->orderBy('event_date')
            ->orderBy('start_time')
            ->get([
                'event_id',
                'title',
                'description',
                'event_date',
                'start_time',
                'end_time',
                'location',
                'latitude',
                'longitude',
                'geofence_radius',
                'geofence_enabled',
                'late_after_minutes',
                'is_active',
                'created_at',
                'updated_at',
            ]);

        return response()->json([
            'success' => true,
            'code' => 'EVENTS_FETCHED',
            'message' => 'Events retrieved successfully.',
            'data' => $events,
        ]);
    }

    /**
     * Return one event.
     */
    public function show(
        Request $request,
        Event $event
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'code' => 'EVENT_FETCHED',
            'message' => 'Event retrieved successfully.',
            'data' => [
                'event_id' => $event->event_id,
                'title' => $event->title,
                'description' => $event->description,
                'event_date' => $event->event_date,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->location,

                'latitude' => $event->latitude,
                'longitude' => $event->longitude,

                'geofence_radius' => $event->geofence_radius,
                'geofence_enabled' => $event->geofence_enabled,

                'late_after_minutes' => $event->late_after_minutes,

                'is_active' => $event->is_active,

                'created_at' => $event->created_at,
                'updated_at' => $event->updated_at,
            ],
        ]);
    }
}