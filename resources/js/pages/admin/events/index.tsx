import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import GeofenceMap from '@/components/geofence-map';

type EventRow = {
    event_id: number;
    title: string;
    description?: string | null;
    event_date: string;
    start_time: string;
    end_time: string;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    geofence_radius?: number | null;
    geofence_enabled?: boolean;
    late_after_minutes?: number;
    is_active: boolean;
};

export default function EventsIndex({ events }: { events: EventRow[] }) {
    const [editing, setEditing] = useState<EventRow | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        event_date: new Date().toISOString().slice(0, 10),
        start_time: '08:00',
        end_time: '17:00',
        location: '',
        latitude: null as number | null,
        longitude: null as number | null,
        geofence_radius: 100,
        geofence_enabled: true,
        late_after_minutes: 15,
        is_active: true,
    });

    const edit = (event: EventRow) => {
        setEditing(event);
        setData({
            title: event.title,
            description: event.description ?? '',
            event_date: String(event.event_date).slice(0, 10),
            start_time: event.start_time.slice(0, 5),
            end_time: event.end_time.slice(0, 5),
            location: event.location ?? '',
            latitude: event.latitude ?? null,
            longitude: event.longitude ?? null,
            geofence_radius: event.geofence_radius ?? 100,
            geofence_enabled: Boolean(event.geofence_enabled),
            late_after_minutes: event.late_after_minutes ?? 15,
            is_active: Boolean(event.is_active),
        });
    };

    const clear = () => {
        setEditing(null);
        reset();
    };

    const useMyLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData('latitude', position.coords.latitude);
                setData('longitude', position.coords.longitude);
            },
            () => alert('Unable to read your current location.'),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(`/events/${editing.event_id}`, { onSuccess: clear });
        } else {
            post('/events', { onSuccess: clear });
        }
    };

    return (
        <>
            <Head title="Event Geofences" />
            <div className="min-h-screen bg-gray-50 p-6 dark:bg-slate-950">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_.9fr]">
                    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold">{editing ? 'Edit event' : 'Create event'}</h1>
                                <p className="text-sm text-gray-500">Click the map to set the geofence center.</p>
                            </div>
                            {editing && <button type="button" onClick={clear} className="text-sm underline">Cancel edit</button>}
                        </div>

                        <input className="w-full rounded-lg border p-3" placeholder="Event title" value={data.title} onChange={e => setData('title', e.target.value)} />
                        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                        <textarea className="w-full rounded-lg border p-3" placeholder="Description" value={data.description} onChange={e => setData('description', e.target.value)} />

                        <div className="grid gap-3 sm:grid-cols-3">
                            <input type="date" className="rounded-lg border p-3" value={data.event_date} onChange={e => setData('event_date', e.target.value)} />
                            <input type="time" className="rounded-lg border p-3" value={data.start_time} onChange={e => setData('start_time', e.target.value)} />
                            <input type="time" className="rounded-lg border p-3" value={data.end_time} onChange={e => setData('end_time', e.target.value)} />
                        </div>

                        <input className="w-full rounded-lg border p-3" placeholder="Location name" value={data.location} onChange={e => setData('location', e.target.value)} />

                        <div className="flex flex-wrap items-center gap-4">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={data.geofence_enabled} onChange={e => setData('geofence_enabled', e.target.checked)} /> Enable geofence</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active</label>
                            <button type="button" onClick={useMyLocation} className="rounded-lg border px-3 py-2 text-sm">Use my current location</button>
                        </div>

                        <GeofenceMap
                            latitude={data.latitude}
                            longitude={data.longitude}
                            radius={Number(data.geofence_radius)}
                            onChange={(lat, lng) => {
                                setData('latitude', lat);
                                setData('longitude', lng);
                            }}
                        />

                        <div className="grid gap-3 sm:grid-cols-4">
                            <input className="rounded-lg border p-3" placeholder="Latitude" value={data.latitude ?? ''} onChange={e => setData('latitude', e.target.value ? Number(e.target.value) : null)} />
                            <input className="rounded-lg border p-3" placeholder="Longitude" value={data.longitude ?? ''} onChange={e => setData('longitude', e.target.value ? Number(e.target.value) : null)} />
                            <label className="text-xs">Radius (m)<input type="number" min={10} max={5000} className="mt-1 w-full rounded-lg border p-3" value={data.geofence_radius} onChange={e => setData('geofence_radius', Number(e.target.value))} /></label>
                            <label className="text-xs">Late after (min)<input type="number" min={0} max={240} className="mt-1 w-full rounded-lg border p-3" value={data.late_after_minutes} onChange={e => setData('late_after_minutes', Number(e.target.value))} /></label>
                        </div>

                        <button disabled={processing} className="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
                            {processing ? 'Saving...' : editing ? 'Update event' : 'Create event'}
                        </button>
                    </form>

                    <div className="rounded-2xl bg-white p-6 shadow dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-bold">Events</h2>
                        <div className="space-y-3">
                            {events.map(event => (
                                <div key={event.event_id} className="rounded-xl border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-xs text-gray-500">{String(event.event_date).slice(0, 10)} · {event.start_time.slice(0,5)}–{event.end_time.slice(0,5)}</p>
                                            <p className="text-xs text-gray-500">{event.location || 'No location'} · radius {event.geofence_radius ?? 0} m</p>
                                        </div>
                                        <span className={event.is_active ? 'text-xs text-emerald-600' : 'text-xs text-gray-400'}>{event.is_active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button type="button" onClick={() => edit(event)} className="rounded-lg border px-3 py-1.5 text-xs">Edit</button>
                                        <button type="button" onClick={() => router.patch(`/events/${event.event_id}/toggle`)} className="rounded-lg border px-3 py-1.5 text-xs">Toggle active</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
