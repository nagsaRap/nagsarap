<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/events/index', [
            'events' => Event::orderByDesc('event_date')->orderByDesc('start_time')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateEvent($request);

        Event::create([
            ...$validated,
            'geofence_enabled' => $request->boolean('geofence_enabled'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Event created successfully!');
    }

    public function update(Request $request, Event $event)
    {
        $validated = $this->validateEvent($request);

        $event->update([
            ...$validated,
            'geofence_enabled' => $request->boolean('geofence_enabled'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Event updated successfully!');
    }

    public function toggleActive(Event $event)
    {
        $event->update(['is_active' => !$event->is_active]);

        return back()->with('success', 'Event status updated!');
    }

    private function validateEvent(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'event_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'location' => ['nullable', 'string', 'max:100'],
            'latitude' => ['required_if:geofence_enabled,true,1,on', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['required_if:geofence_enabled,true,1,on', 'nullable', 'numeric', 'between:-180,180'],
            'geofence_radius' => ['required_if:geofence_enabled,true,1,on', 'nullable', 'integer', 'min:10', 'max:5000'],
            'geofence_enabled' => ['boolean'],
            'late_after_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'is_active' => ['boolean'],
        ]);
    }
}
