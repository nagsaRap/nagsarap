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
        $request->validate([
            'title'       => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'event_date'  => ['required', 'date'],
            'start_time'  => ['required'],
            'end_time'    => ['nullable', 'after:start_time'],
            'location'    => ['nullable', 'string', 'max:100'],
            'is_active'   => ['boolean'],
        ]);

        Event::create([
            'title'       => $request->title,
            'description' => $request->description,
            'event_date'  => $request->event_date,
            'start_time'  => $request->start_time,
            'end_time'    => $request->end_time,
            'location'    => $request->location,
            'is_active'   => $request->input('is_active', true),
        ]);

        return back()->with('success', 'Event created successfully!');
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