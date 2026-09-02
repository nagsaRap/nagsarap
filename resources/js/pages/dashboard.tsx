import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Clock,
    ShieldCheck,
    RefreshCw,
    MapPin,
    X,
    ChevronRight,
    TrendingUp,
    ListChecks,
    CalendarClock,
} from 'lucide-react';

type Event = {
    event_id: number;
    title: string;
    description?: string | null;

    event_date: string;
    start_time: string;
    end_time?: string | null;

    location?: string | null;
    
    latitude?: number | null;
    longitude?: number | null;

    geofence_radius?: number | null;
    geofence_enabled?: boolean;

    is_active?: boolean;
};

type AttendanceLog = {
    attendance_id: number;
    logged_at: string;
    status: string;
    confidence_score: number;
    event: Event;
};

type Student = {
    student_id: number;
    firstname: string;
    surname: string;
    student_number: string;
    face_photo_url: string | null;
    attendances: AttendanceLog[];
};

type DashboardProps = {
    student: Student;
    activeEvents: Event[];
    upcomingEvents?: Event[];
    totalExpectedEvents?: number;
};

const GOLD = '#C9973E';
const GOLD_DARK = '#B0812E';

function formatEventTime(startTime?: string | null, endTime?: string | null): string {
    if (!startTime) return '';

    const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formattedStart = parseTime(startTime);
    if (!endTime) return formattedStart;

    const formattedEnd = parseTime(endTime);
    return `${formattedStart} - ${formattedEnd}`;
}

export default function Dashboard({
    student,
    activeEvents,
    upcomingEvents = [],
    totalExpectedEvents,
}: DashboardProps) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const checkedInEventIds = new Set(
        student.attendances
            .filter((log) => log.status?.toLowerCase() === 'present' || log.status?.toLowerCase() === 'verified')
            .map((log) => log.event?.event_id)
    );

    const eventsAttended = student.attendances.length;
    const attendanceRate =
        totalExpectedEvents && totalExpectedEvents > 0
            ? Math.round((eventsAttended / totalExpectedEvents) * 100)
            : null;

    const recentAttendances = [...student.attendances]
        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
        .slice(0, 3);

    return (
        <>
            <Head title="Student Dashboard" />

            <div className="w-full min-h-screen bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-white p-6 space-y-6 transition-colors duration-200">
                
                {/* WELCOME HEADER */}
                <div className="flex w-full items-center justify-between rounded-xl bg-white dark:bg-[#090d16] p-6 shadow-sm border border-gray-100 dark:border-slate-800/60">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {student.firstname} {student.surname}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Student ID {student.student_number}</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Biometrics verified</span>
                    </div>
                </div>

                {/* STAT CARDS ROW */}
                <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={<TrendingUp className="h-5 w-5 text-[#1B1F5C] dark:text-amber-400" aria-hidden="true" />}
                        label="Attendance rate"
                        value={attendanceRate !== null ? `${attendanceRate}%` : '—'}
                        caption={
                            totalExpectedEvents
                                ? `${eventsAttended} of ${totalExpectedEvents} events`
                                : 'Not enough data yet'
                        }
                    />
                    <StatCard
                        icon={<ListChecks className="h-5 w-5 text-[#1B1F5C] dark:text-amber-400" aria-hidden="true" />}
                        label="Events attended"
                        value={String(eventsAttended)}
                        caption="This term"
                    />
                    <StatCard
                        icon={<CalendarClock className="h-5 w-5 text-[#1B1F5C] dark:text-amber-400" aria-hidden="true" />}
                        label="Events today"
                        value={String(activeEvents.length)}
                        caption={
                            activeEvents.length - checkedInEventIds.size > 0
                                ? `${activeEvents.length - checkedInEventIds.size} still to check in`
                                : 'All checked in'
                        }
                    />
                </div>

                {/* TODAY'S EVENTS LIST */}
                <div className="w-full rounded-xl bg-white dark:bg-[#090d16] shadow-sm border border-gray-100 dark:border-slate-800/60 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800/60">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Today's events</h2>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{activeEvents.length} scheduled</span>
                    </div>

                    {activeEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Calendar className="h-10 w-10 mb-2 stroke-1 text-gray-400 dark:text-gray-600" aria-hidden="true" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No events today</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Check back when an event opens for check-in.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800/60">
                            {activeEvents.map((evt) => {
                                const isCheckedIn = checkedInEventIds.has(evt.event_id);
                                return (
                                    <li key={evt.event_id}>
                                        <div className="w-full flex items-center gap-4 px-6 py-4 text-left">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-slate-800/80 text-[#1B1F5C] dark:text-amber-400 text-xs font-semibold">
                                                <Clock className="h-4 w-4" aria-hidden="true" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{evt.title}</p>
                                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {evt.start_time && (
                                                        <span>{formatEventTime(evt.start_time, evt.end_time)}</span>
                                                    )}
                                                    {evt.location ? ` · ${evt.location}` : ' · Location TBA'}
                                                </p>
                                            </div>

                                            {isCheckedIn ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Checked in
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedEvent(evt)}
                                                    className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold text-white shrink-0 transition-colors"
                                                    style={{ backgroundColor: GOLD }}
                                                >
                                                    Check in
                                                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* COMING UP */}
                {upcomingEvents.length > 0 && (
                    <div className="w-full rounded-xl bg-white dark:bg-[#090d16] shadow-sm border border-gray-100 dark:border-slate-800/60 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800/60">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Coming up</h2>
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-1 text-xs font-semibold"
                                style={{ color: GOLD }}
                            >
                                View all
                                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800/60">
                            {upcomingEvents.slice(0, 3).map((evt) => (
                                <li key={evt.event_id} className="flex items-center gap-4 px-6 py-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-slate-800/80 text-[#1B1F5C] dark:text-amber-400 text-xs font-semibold">
                                        <Calendar className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{evt.title}</p>
                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {evt.event_date}
                                            {evt.start_time ? ` (${formatEventTime(evt.start_time, evt.end_time)})` : ''}
                                            {evt.location ? ` · ${evt.location}` : ' · Location TBA'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* RECENT ATTENDANCE */}
                <div className="w-full rounded-xl bg-white dark:bg-[#090d16] shadow-sm border border-gray-100 dark:border-slate-800/60 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800/60">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent attendance</h2>
                        <Link
                            href="/attendance/history"
                            className="inline-flex items-center gap-1 text-xs font-semibold"
                            style={{ color: GOLD }}
                        >
                            View all
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                    </div>

                    {recentAttendances.length > 0 ? (
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800/60">
                            {recentAttendances.map((log) => (
                                <li key={log.attendance_id} className="flex items-center justify-between px-6 py-3.5">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {log.event?.title || 'Event'}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {new Date(log.logged_at).toLocaleDateString()} {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {log.event?.location || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <ConfidenceBadge score={log.confidence_score} />
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                            {log.status?.toLowerCase() || 'present'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500">
                            <p className="text-xs">No attendance records yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedEvent && (
                <CheckInModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
        </>
    );
}

function StatCard({ icon, label, value, caption }: { icon: React.ReactNode; label: string; value: string; caption: string }) {
    return (
        <div className="rounded-xl bg-white dark:bg-[#090d16] p-5 shadow-sm border border-gray-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <span>{icon}</span>
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{caption}</p>
        </div>
    );
}

function ConfidenceBadge({ score }: { score: number }) {
    const pct = score <= 1 ? score * 100 : score;
    return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 font-mono text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
            {pct.toFixed(1)}%
        </span>
    );
}

function CheckInModal({
    event,
    onClose,
}: {
    event: Event;
    onClose: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [streamStarted, setStreamStarted] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const [feedbackMessage, setFeedbackMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    // =========================================================
    // GEOFENCE / LOCATION STATES
    // =========================================================

    const [locationStatus, setLocationStatus] = useState<
        'idle' | 'loading' | 'ready' | 'error'
    >('idle');

    const [locationError, setLocationError] =
        useState<string | null>(null);

    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
        accuracy: number;
    } | null>(null);

    // =========================================================
    // GET CURRENT LOCATION
    // =========================================================

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            setLocationError(
                'Geolocation is not supported by this browser.'
            );
            return;
        }

        setLocationStatus('loading');
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };

                setUserLocation(location);
                setLocationStatus('ready');

                console.log('Location acquired:', location);
            },

            (error) => {
                setLocationStatus('error');

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError(
                            'Location permission was denied. Please allow location access.'
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        setLocationError(
                            'Your current location is unavailable.'
                        );
                        break;

                    case error.TIMEOUT:
                        setLocationError(
                            'Location request timed out. Please try again.'
                        );
                        break;

                    default:
                        setLocationError(
                            'Unable to determine your location.'
                        );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    // =========================================================
    // START CAMERA + LOCATION WHEN MODAL OPENS
    // =========================================================

    useEffect(() => {
        let isMounted = true;
        let activeStream: MediaStream | null = null;

        async function startCamera() {
            try {
                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: 640,
                            height: 480,
                            facingMode: 'user',
                        },
                        audio: false,
                    });

                activeStream = stream;

                if (videoRef.current && isMounted) {
                    videoRef.current.srcObject = stream;
                    setStreamStarted(true);
                }
            } catch (err) {
                if (isMounted) {
                    setCameraError(
                        'Camera access was denied or is unavailable.'
                    );
                }
            }
        }

        startCamera();

        // Get GPS immediately when modal opens
        requestLocation();

        return () => {
            isMounted = false;

            activeStream
                ?.getTracks()
                .forEach((track) => track.stop());
        };
    }, []);

    // =========================================================
    // SCAN ATTENDANCE
    // =========================================================

    const handleScanAttendance = async () => {
        if (!videoRef.current) {
            return;
        }

        // =====================================================
        // LOCATION REQUIRED
        // =====================================================

        if (!userLocation) {
            setFeedbackMessage({
                type: 'error',
                text: 'Your current location is required before recording attendance.',
            });

            requestLocation();

            return;
        }

        // Optional browser-side accuracy check.
        // Laravel still performs the final authoritative check.
        if (userLocation.accuracy > 100) {
            setFeedbackMessage({
                type: 'error',
                text:
                    `GPS accuracy is currently ±${Math.round(
                        userLocation.accuracy
                    )} meters. Please wait for a more accurate location and try again.`,
            });

            requestLocation();

            return;
        }

        setIsScanning(true);
        setFeedbackMessage(null);

        const video = videoRef.current;
        const canvas =
            canvasRef.current ||
            document.createElement('canvas');

        canvas.width =
            video.videoWidth || 640;

        canvas.height =
            video.videoHeight || 480;

        const ctx =
            canvas.getContext('2d');

        if (!ctx) {
            setIsScanning(false);

            setFeedbackMessage({
                type: 'error',
                text: 'Unable to access camera canvas.',
            });

            return;
        }

        // Mirror front camera
        ctx.save();

        ctx.translate(
            canvas.width,
            0
        );

        ctx.scale(
            -1,
            1
        );

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setFeedbackMessage({
                        type: 'error',
                        text: 'Failed to capture frame from webcam.',
                    });

                    setIsScanning(false);

                    return;
                }

                // =================================================
                // BUILD FORM DATA
                // =================================================

                const formData =
                    new FormData();

                formData.append(
                    'event_id',
                    String(event.event_id)
                );

                formData.append(
                    'live_camera_frame',
                    blob,
                    'attendance-scan.jpg'
                );

                // GPS data
                formData.append(
                    'latitude',
                    String(
                        userLocation.latitude
                    )
                );

                formData.append(
                    'longitude',
                    String(
                        userLocation.longitude
                    )
                );

                formData.append(
                    'location_accuracy',
                    String(
                        userLocation.accuracy
                    )
                );

                console.log(
                    'Submitting attendance:',
                    {
                        event_id:
                            event.event_id,

                        latitude:
                            userLocation.latitude,

                        longitude:
                            userLocation.longitude,

                        accuracy:
                            userLocation.accuracy,
                    }
                );

                // =================================================
                // SEND TO LARAVEL
                // =================================================

                router.post(
                    '/attendance/check-in',
                    formData,
                    {
                        forceFormData: true,

                        preserveScroll: true,

                        onSuccess: () => {
                            setFeedbackMessage({
                                type: 'success',
                                text: 'Attendance verified and recorded!',
                            });

                            setIsScanning(false);
                        },

                        onError: (
                            errors: any
                        ) => {
                            console.error(
                                'Attendance errors:',
                                errors
                            );

                            setFeedbackMessage({
                                type: 'error',

                                text:
                                    errors.attendance ||
                                    errors.latitude ||
                                    errors.longitude ||
                                    errors.location_accuracy ||
                                    errors.live_camera_frame ||
                                    'Attendance verification failed.',
                            });

                            setIsScanning(false);
                        },

                        onFinish: () => {
                            setIsScanning(false);
                        },
                    }
                );
            },

            'image/jpeg',
            0.95
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => {
                if (
                    e.target ===
                    e.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#090d16] text-gray-900 dark:text-white shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800">

                {/* HEADER */}
                <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800">

                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <h2 className="text-lg font-bold pr-8 text-gray-900 dark:text-white">
                        {event.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">

                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />

                            {event.event_date}{' '}

                            {formatEventTime(
                                event.start_time,
                                event.end_time
                            )}
                        </span>

                        <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />

                            {event.location ||
                                'Location TBA'}
                        </span>

                    </div>
                </div>

                <div className="flex flex-col items-center px-6 py-6">

                    {/* CAMERA */}

                    <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-[#1B1F5C] dark:border-amber-400 bg-black mb-1">

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover -scale-x-100"
                        />

                        {!streamStarted &&
                            !cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">

                                    <RefreshCw className="h-6 w-6 animate-spin text-white/80" />

                                </div>
                            )}

                        {cameraError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-4 text-center">

                                <AlertCircle className="h-6 w-6 text-white/80" />

                                <p className="text-[11px] text-white/80">
                                    {cameraError}
                                </p>

                            </div>
                        )}
                    </div>

                    <p className="mb-4 text-[11px] text-gray-400 dark:text-gray-500">
                        Center your face in the frame
                    </p>

                    {/* ================================================= */}
                    {/* LOCATION STATUS */}
                    {/* ================================================= */}

                    <div className="w-full mb-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-3">

                        <div className="flex items-start gap-3">

                            <MapPin
                                className={`h-5 w-5 shrink-0 mt-0.5 ${
                                    locationStatus ===
                                    'ready'
                                        ? 'text-emerald-500'
                                        : locationStatus ===
                                            'error'
                                          ? 'text-red-500'
                                          : 'text-gray-400'
                                }`}
                            />

                            <div className="flex-1">

                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Location verification
                                </p>

                                {locationStatus ===
                                    'idle' && (
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        Waiting for your
                                        location...
                                    </p>
                                )}

                                {locationStatus ===
                                    'loading' && (
                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400">

                                        <RefreshCw className="h-3 w-3 animate-spin" />

                                        Checking current
                                        location...

                                    </div>
                                )}

                                {locationStatus ===
                                    'ready' &&
                                    userLocation && (
                                        <>
                                            <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                Location
                                                acquired
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">

                                                GPS accuracy:
                                                ±
                                                {Math.round(
                                                    userLocation.accuracy
                                                )}{' '}
                                                meters

                                            </p>

                                            <p className="mt-0.5 font-mono text-[9px] text-gray-400">

                                                {userLocation.latitude.toFixed(
                                                    6
                                                )}
                                                ,{' '}
                                                {userLocation.longitude.toFixed(
                                                    6
                                                )}

                                            </p>
                                        </>
                                    )}

                                {locationStatus ===
                                    'error' && (
                                    <>
                                        <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">

                                            {locationError}

                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                requestLocation
                                            }
                                            className="mt-1 text-[10px] font-semibold underline text-blue-600 dark:text-blue-400"
                                        >
                                            Try location
                                            again
                                        </button>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* ================================================= */}
                    {/* FEEDBACK */}
                    {/* ================================================= */}

                    {feedbackMessage && (
                        <div
                            className={`w-full mb-4 flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
                                feedbackMessage.type ===
                                'success'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                            }`}
                        >

                            {feedbackMessage.type ===
                            'success' ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                            ) : (
                                <AlertCircle className="h-4 w-4 shrink-0" />
                            )}

                            <span>
                                {
                                    feedbackMessage.text
                                }
                            </span>

                        </div>
                    )}

                    {/* ================================================= */}
                    {/* CHECK IN BUTTON */}
                    {/* ================================================= */}

                    <button
                        onClick={
                            handleScanAttendance
                        }
                        disabled={
                            isScanning ||
                            !streamStarted ||
                            locationStatus !==
                                'ready'
                        }
                        className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                        style={{
                            backgroundColor:
                                isScanning
                                    ? GOLD_DARK
                                    : GOLD,
                        }}
                    >

                        {isScanning ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />

                                <span>
                                    Verifying...
                                </span>
                            </>
                        ) : locationStatus ===
                          'loading' ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />

                                <span>
                                    Checking
                                    location...
                                </span>
                            </>
                        ) : locationStatus ===
                          'error' ? (
                            <>
                                <MapPin className="h-4 w-4" />

                                <span>
                                    Location
                                    required
                                </span>
                            </>
                        ) : (
                            <>
                                <Camera className="h-4 w-4" />

                                <span>
                                    Scan to check in
                                </span>
                            </>
                        )}

                    </button>

                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="hidden"
            />

        </div>
    );
}