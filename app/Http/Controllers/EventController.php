<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Display event management page.
     */
    public function index(): Response
    {
        $events = Event::query()
            ->orderByDesc('event_date')
            ->orderBy('start_time')
            ->get();

        return Inertia::render(
            'admin/events/index',
            [
                'events' => $events,
            ]
        );
    }

    /**
     * Store a newly created event.
     */
    public function store(
        Request $request
    ): RedirectResponse {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'event_date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'end_time' => [
                'required',
                'date_format:H:i',
                'after:start_time',
            ],

            'location' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
             * Geofence
             */
            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90',
                'required_if:geofence_enabled,1,true',
            ],

            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180',
                'required_if:geofence_enabled,1,true',
            ],

            'geofence_radius' => [
                'nullable',
                'integer',
                'min:10',
                'max:5000',
                'required_if:geofence_enabled,1,true',
            ],

            'geofence_enabled' => [
                'nullable',
                'boolean',
            ],

            /*
             * Number of minutes after start_time
             * before attendance becomes late.
             */
            'late_after_minutes' => [
                'nullable',
                'integer',
                'min:0',
                'max:1440',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        Event::create([
            'title' =>
                $validated['title'],

            'description' =>
                $validated['description']
                ?? null,

            'event_date' =>
                $validated['event_date'],

            'start_time' =>
                $validated['start_time'],

            'end_time' =>
                $validated['end_time'],

            'location' =>
                $validated['location']
                ?? null,

            'latitude' =>
                $validated['latitude']
                ?? null,

            'longitude' =>
                $validated['longitude']
                ?? null,

            'geofence_radius' =>
                $validated['geofence_radius']
                ?? 100,

            'geofence_enabled' =>
                $request->boolean(
                    'geofence_enabled'
                ),

            'late_after_minutes' =>
                $validated['late_after_minutes']
                ?? 0,

            'is_active' =>
                $request->boolean(
                    'is_active'
                ),
        ]);

        return back()->with(
            'success',
            'Event created successfully.'
        );
    }

    /**
     * Display one event.
     */
    public function show(
        Event $event
    ): Response {
        $event->load([
            'attendances.student',
        ]);

        return Inertia::render(
            'admin/events/show',
            [
                'event' => $event,
            ]
        );
    }

    /**
     * Update an existing event.
     */
    public function update(
        Request $request,
        Event $event
    ): RedirectResponse {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'event_date' => [
                'required',
                'date',
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'end_time' => [
                'required',
                'date_format:H:i',
                'after:start_time',
            ],

            'location' => [
                'nullable',
                'string',
                'max:255',
            ],

            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90',
                'required_if:geofence_enabled,1,true',
            ],

            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180',
                'required_if:geofence_enabled,1,true',
            ],

            'geofence_radius' => [
                'nullable',
                'integer',
                'min:10',
                'max:5000',
                'required_if:geofence_enabled,1,true',
            ],

            'geofence_enabled' => [
                'nullable',
                'boolean',
            ],

            'late_after_minutes' => [
                'nullable',
                'integer',
                'min:0',
                'max:1440',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $event->update([
            'title' =>
                $validated['title'],

            'description' =>
                $validated['description']
                ?? null,

            'event_date' =>
                $validated['event_date'],

            'start_time' =>
                $validated['start_time'],

            'end_time' =>
                $validated['end_time'],

            'location' =>
                $validated['location']
                ?? null,

            'latitude' =>
                $validated['latitude']
                ?? null,

            'longitude' =>
                $validated['longitude']
                ?? null,

            'geofence_radius' =>
                $validated['geofence_radius']
                ?? $event->geofence_radius
                ?? 100,

            'geofence_enabled' =>
                $request->boolean(
                    'geofence_enabled'
                ),

            'late_after_minutes' =>
                $validated['late_after_minutes']
                ?? 0,

            'is_active' =>
                $request->boolean(
                    'is_active'
                ),
        ]);

        return back()->with(
            'success',
            'Event updated successfully.'
        );
    }

    /**
     * Delete event.
     */
    public function destroy(
        Event $event
    ): RedirectResponse {
        /*
         * If your database foreign keys prevent
         * deleting an event that already has
         * attendance records, Laravel/MySQL will
         * reject the deletion rather than silently
         * destroying attendance history.
         */

        $event->delete();

        return back()->with(
            'success',
            'Event deleted successfully.'
        );
    }

    /**
     * Enable event attendance.
     */
    public function activate(
        Event $event
    ): RedirectResponse {
        $event->update([
            'is_active' => true,
        ]);

        return back()->with(
            'success',
            'Event attendance opened.'
        );
    }

    /**
     * Disable event attendance.
     */
    public function deactivate(
        Event $event
    ): RedirectResponse {
        $event->update([
            'is_active' => false,
        ]);

        return back()->with(
            'success',
            'Event attendance closed.'
        );
    }
}