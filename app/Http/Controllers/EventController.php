<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Display event management page.
     */
    public function index()
    {
        $events = Event::orderBy('event_date', 'desc')->get();

        return Inertia::render('admin/events/index', [
            'events' => $events,
        ]);
    }

    /**
     * Store a newly created event in the database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
    
            'event_date' => ['required', 'date'],
            'start_time' => ['required'],
            'end_time' => ['nullable', 'after:start_time'],
    
            'location' => ['nullable', 'string', 'max:100'],
    
            'latitude' => [
                'required_if:geofence_enabled,true',
                'nullable',
                'numeric',
                'between:-90,90'
            ],
    
            'longitude' => [
                'required_if:geofence_enabled,true',
                'nullable',
                'numeric',
                'between:-180,180'
            ],
    
            'geofence_radius' => [
                'required_if:geofence_enabled,true',
                'nullable',
                'integer',
                'min:10',
                'max:5000'
            ],
    
            'geofence_enabled' => ['boolean'],
    
            'is_active' => ['boolean'],
        ]);
    
        Event::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
    
            'event_date' => $validated['event_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'] ?? null,
    
            'location' => $validated['location'] ?? null,
    
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
    
            'geofence_radius' =>
                $validated['geofence_radius'] ?? 100,
    
            'geofence_enabled' =>
                $request->boolean('geofence_enabled'),
    
            'is_active' =>
                $request->boolean('is_active', true),
        ]);
    
        return back()->with(
            'success',
            'Event created successfully!'
        );
    }

    /**
     * Toggle active status of an event.
     */
    public function toggleActive(Event $event)
    {
        $event->update([
            'is_active' => !$event->is_active,
        ]);

        return back()->with('success', 'Event status updated!');
    }
}