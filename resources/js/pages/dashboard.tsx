import {
    Head,
    Link,
    router,
    usePage,
} from '@inertiajs/react';

import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    Camera,
    CheckCircle2,
    ChevronDown,
    Clock,
    History,
    LogOut,
    MapPin,
    RefreshCw,
    Settings,
    ShieldCheck,
    TrendingUp,
    UserRound,
    Wifi,
    X,
} from 'lucide-react';

import {
    useEffect,
    useRef,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

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

    late_after_minutes?: number;

    is_active?: boolean;
};

type AttendanceLog = {
    attendance_id: number;

    logged_at: string;

    attendance_time?: string | null;
    sync_time?: string | null;

    status: string;

    confidence_score: number;

    event: Event;
};

type Student = {
    student_id: number;

    student_number: string;

    firstname: string;

    surname: string;

    college?: string | null;

    college_code?: string | null;

    verification_status?: string;

    attendances: AttendanceLog[];
};

type DashboardProps = {
    student: Student;

    activeEvents?: Event[];

    upcomingEvents?: Event[];

    totalExpectedEvents?: number;
};

type SharedProps = {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            role?: string;
        };
    };
};

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export default function Dashboard({
    student,
    activeEvents = [],
    upcomingEvents = [],
    totalExpectedEvents = 0,
}: DashboardProps) {
    const page = usePage<SharedProps>();
    const user = page.props.auth?.user;

    const [
        selectedEvent,
        setSelectedEvent,
    ] = useState<Event | null>(null);

    const [
        profileOpen,
        setProfileOpen,
    ] = useState(false);

    const successfulAttendances =
        student.attendances.filter(
            (attendance) => {
                const status =
                    attendance.status
                        ?.toLowerCase();

                return [
                    'present',
                    'late',
                    'verified',
                ].includes(status);
            },
        );

    const attendanceRate =
        totalExpectedEvents > 0
            ? Math.min(
                  100,
                  Math.round(
                      (
                          successfulAttendances.length /
                          totalExpectedEvents
                      ) *
                          100,
                  ),
              )
            : 0;

    const checkedEventIds =
        new Set(
            successfulAttendances.map(
                (attendance) =>
                    attendance.event
                        ?.event_id,
            ),
        );

    const recentAttendance = [
        ...student.attendances,
    ]
        .sort(
            (a, b) =>
                new Date(
                    b.attendance_time ||
                        b.logged_at,
                ).getTime() -
                new Date(
                    a.attendance_time ||
                        a.logged_at,
                ).getTime(),
        )
        .slice(0, 5);

    const logout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Head title="Student Dashboard" />

            <div className="min-h-screen bg-[#F6F7FB] text-slate-900 dark:bg-[#050914] dark:text-white">

                {/* =====================================================
                    TOP NAVIGATION
                ===================================================== */}

                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#080D1A]/95">

                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                        {/* BRAND */}

                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121A3A] text-white shadow-sm">

                                <ShieldCheck className="h-5 w-5" />

                            </div>

                            <div className="leading-tight">

                                <p className="text-sm font-extrabold tracking-wide text-[#121A3A] dark:text-white">
                                    CCIS
                                </p>

                                <p className="text-[10px] font-medium text-slate-400">
                                    Attendance System
                                </p>

                            </div>

                        </Link>

                        {/* RIGHT SIDE */}

                        <div className="flex items-center gap-3">

                            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:flex dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-400">

                                <Wifi className="h-3.5 w-3.5" />

                                Online

                            </div>

                            {/* PROFILE */}

                            <div className="relative">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setProfileOpen(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#121A3A] text-xs font-bold text-white">
                                        {getInitials(
                                            user?.name ||
                                                `${student.firstname} ${student.surname}`,
                                        )}
                                    </div>

                                    <div className="hidden text-left md:block">

                                        <p className="max-w-[140px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                                            {user?.name ||
                                                `${student.firstname} ${student.surname}`}
                                        </p>

                                        <p className="text-[10px] text-slate-400">
                                            Student
                                        </p>

                                    </div>

                                    <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#0B1120]">

                                        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">

                                            <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                {student.firstname}{' '}
                                                {student.surname}
                                            </p>

                                            <p className="mt-1 truncate text-[10px] text-slate-400">
                                                {user?.email || ''}
                                            </p>

                                        </div>

                                        <div className="p-2">

                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                <UserRound className="h-4 w-4" />

                                                Profile
                                            </Link>

                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                <Settings className="h-4 w-4" />

                                                Settings
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={logout}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            >
                                                <LogOut className="h-4 w-4" />

                                                Sign out
                                            </button>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                </header>

                {/* =====================================================
                    PAGE
                ===================================================== */}

                <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* =================================================
                        HERO
                    ================================================= */}

                    <section className="relative overflow-hidden rounded-3xl bg-[#121A3A] p-6 text-white shadow-lg sm:p-8">

                        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#D39A2C]/15" />

                        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E6B64B]">
                                    Student Portal
                                </p>

                                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">

                                    Good day,{' '}

                                    {student.firstname}.

                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                                    Record your attendance online using secure facial verification and geofencing.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-2">

                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold">

                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />

                                        Biometrics verified

                                    </div>

                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold">

                                        <Wifi className="h-3.5 w-3.5 text-emerald-400" />

                                        Online mode ready

                                    </div>

                                </div>

                            </div>

                            {/* QUICK ATTENDANCE CTA */}

                            <button
                                type="button"
                                disabled={
                                    activeEvents.length === 0
                                }
                                onClick={() => {
                                    if (
                                        activeEvents.length >
                                        0
                                    ) {
                                        setSelectedEvent(
                                            activeEvents[0],
                                        );
                                    }
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D39A2C] px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#BB8724] disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                            >

                                <Camera className="h-5 w-5" />

                                {activeEvents.length > 0
                                    ? 'Record Attendance'
                                    : 'No Active Event'}

                                <ArrowRight className="h-4 w-4" />

                            </button>

                        </div>

                    </section>

                    {/* =================================================
                        STUDENT INFO
                    ================================================= */}

                    <section className="grid gap-4 md:grid-cols-2">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#090E1C]">

                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                Student Information
                            </p>

                            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                                {student.firstname}{' '}
                                {student.surname}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {student.student_number}
                            </p>

                            {student.college && (
                                <p className="mt-1 text-xs text-slate-400">
                                    {student.college}
                                </p>
                            )}

                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#090E1C]">

                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                Attendance Status
                            </p>

                            <div className="mt-3 flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">

                                    <ShieldCheck className="h-5 w-5" />

                                </div>

                                <div>

                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        Account Verified
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Ready for secure attendance recording
                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        METRICS
                    ================================================= */}

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <MetricCard
                            label="Attendance Rate"
                            value={`${attendanceRate}%`}
                            description={`${successfulAttendances.length} of ${totalExpectedEvents} events`}
                            icon={
                                <TrendingUp className="h-5 w-5" />
                            }
                        />

                        <MetricCard
                            label="Events Attended"
                            value={String(
                                successfulAttendances.length,
                            )}
                            description="Verified records"
                            icon={
                                <CheckCircle2 className="h-5 w-5" />
                            }
                        />

                        <MetricCard
                            label="Events Today"
                            value={String(
                                activeEvents.length,
                            )}
                            description={
                                activeEvents.length > 0
                                    ? 'Available now'
                                    : 'No active event'
                            }
                            icon={
                                <CalendarDays className="h-5 w-5" />
                            }
                        />

                    </section>

                    {/* =================================================
                        TODAY'S EVENTS
                    ================================================= */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#090E1C]">

                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 dark:border-slate-800">

                            <div>

                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Today's Events
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Tap an event to record attendance.
                                </p>

                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-900">
                                {activeEvents.length}{' '}
                                active
                            </span>

                        </div>

                        {activeEvents.length ===
                        0 ? (

                            <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">

                                    <CalendarDays className="h-7 w-7 text-slate-400" />

                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    No events today
                                </h3>

                                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                    Active events will appear here when attendance opens.
                                </p>

                            </div>

                        ) : (

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">

                                {activeEvents.map(
                                    (event) => {
                                        const checked =
                                            checkedEventIds.has(
                                                event.event_id,
                                            );

                                        return (
                                            <div
                                                key={
                                                    event.event_id
                                                }
                                                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:px-6"
                                            >

                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D39A2C]/10 text-[#D39A2C]">

                                                    <CalendarDays className="h-5 w-5" />

                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                                                            {event.title}
                                                        </h3>

                                                        {event.geofence_enabled && (
                                                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase text-blue-600 dark:bg-blue-950/30">
                                                                Geofence
                                                            </span>
                                                        )}

                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">

                                                        <span className="flex items-center gap-1">

                                                            <Clock className="h-3.5 w-3.5" />

                                                            {formatTime(
                                                                event.start_time,
                                                            )}

                                                            {event.end_time &&
                                                                ` – ${formatTime(
                                                                    event.end_time,
                                                                )}`}

                                                        </span>

                                                        <span className="flex items-center gap-1">

                                                            <MapPin className="h-3.5 w-3.5" />

                                                            {event.location ||
                                                                'Location TBA'}

                                                        </span>

                                                    </div>

                                                </div>

                                                {checked ? (

                                                    <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-400">

                                                        <CheckCircle2 className="h-4 w-4" />

                                                        Recorded

                                                    </div>

                                                ) : (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedEvent(
                                                                event,
                                                            )
                                                        }
                                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#121A3A] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#1B2858] sm:w-auto"
                                                    >

                                                        <Camera className="h-4 w-4" />

                                                        Record Attendance

                                                    </button>

                                                )}

                                            </div>
                                        );
                                    },
                                )}

                            </div>

                        )}

                    </section>

                    {/* =================================================
                        LOWER SECTIONS
                    ================================================= */}

                    <div className="grid gap-6 xl:grid-cols-2">

                        {/* UPCOMING */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#090E1C]">

                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6 dark:border-slate-800">

                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Upcoming Events
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Future CCIS activities
                                </p>

                            </div>

                            {upcomingEvents.length ===
                            0 ? (

                                <div className="p-10 text-center text-xs text-slate-400">
                                    No upcoming events.
                                </div>

                            ) : (

                                <div className="divide-y divide-slate-100 dark:divide-slate-800">

                                    {upcomingEvents
                                        .slice(0, 5)
                                        .map(
                                            (
                                                event,
                                            ) => (

                                                <div
                                                    key={
                                                        event.event_id
                                                    }
                                                    className="flex items-center gap-4 px-5 py-4 sm:px-6"
                                                >

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900">

                                                        <CalendarDays className="h-4 w-4" />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                            {
                                                                event.title
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">

                                                            {formatDate(
                                                                event.event_date,
                                                            )}

                                                            {' · '}

                                                            {formatTime(
                                                                event.start_time,
                                                            )}

                                                        </p>

                                                    </div>

                                                </div>

                                            ),
                                        )}

                                </div>

                            )}

                        </section>

                        {/* RECENT ATTENDANCE */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#090E1C]">

                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 dark:border-slate-800">

                                <div>

                                    <h2 className="font-bold text-slate-900 dark:text-white">
                                        Recent Attendance
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Latest verified records
                                    </p>

                                </div>

                                <History className="h-5 w-5 text-slate-400" />

                            </div>

                            {recentAttendance.length ===
                            0 ? (

                                <div className="p-10 text-center text-xs text-slate-400">
                                    No attendance records yet.
                                </div>

                            ) : (

                                <div className="divide-y divide-slate-100 dark:divide-slate-800">

                                    {recentAttendance.map(
                                        (
                                            attendance,
                                        ) => (

                                            <div
                                                key={
                                                    attendance.attendance_id
                                                }
                                                className="flex items-center gap-4 px-5 py-4 sm:px-6"
                                            >

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">

                                                    <CheckCircle2 className="h-5 w-5" />

                                                </div>

                                                <div className="min-w-0 flex-1">

                                                    <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">

                                                        {attendance.event
                                                            ?.title ||
                                                            'Attendance'}

                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">

                                                        {formatDateTime(
                                                            attendance.attendance_time ||
                                                                attendance.logged_at,
                                                        )}

                                                    </p>

                                                </div>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                                                        attendance.status
                                                            ?.toLowerCase() ===
                                                        'late'
                                                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                                                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                                                    }`}
                                                >
                                                    {
                                                        attendance.status
                                                    }
                                                </span>

                                            </div>

                                        ),
                                    )}

                                </div>

                            )}

                        </section>

                    </div>

                </main>

            </div>

            {/* ATTENDANCE MODAL */}

            {selectedEvent && (
                <OnlineAttendanceModal
                    event={
                        selectedEvent
                    }
                    onClose={() =>
                        setSelectedEvent(
                            null,
                        )
                    }
                />
            )}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| METRIC CARD
|--------------------------------------------------------------------------
*/

function MetricCard({
    label,
    value,
    description,
    icon,
}: {
    label: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#090E1C]">

            <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D39A2C]/10 text-[#D39A2C]">
                    {icon}
                </div>

                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {label}
                </p>

            </div>

            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {value}
            </p>

            <p className="mt-1 text-xs text-slate-400">
                {description}
            </p>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| ATTENDANCE MODAL
|--------------------------------------------------------------------------
*/

function OnlineAttendanceModal({
    event,
    onClose,
}: {
    event: Event;
    onClose: () => void;
}) {
    const videoRef =
        useRef<HTMLVideoElement | null>(
            null,
        );

    const canvasRef =
        useRef<HTMLCanvasElement | null>(
            null,
        );

    const faceLandmarkerRef =
        useRef<any>(null);

    const animationFrameRef =
        useRef<number | null>(
            null,
        );

    const [
        cameraReady,
        setCameraReady,
    ] = useState(false);

    const [
        cameraError,
        setCameraError,
    ] = useState<string | null>(
        null,
    );

    const [
        location,
        setLocation,
    ] = useState<{
        latitude: number;
        longitude: number;
        accuracy: number;
    } | null>(null);

    const [
        locationLoading,
        setLocationLoading,
    ] = useState(true);

    const [
        locationError,
        setLocationError,
    ] = useState<string | null>(
        null,
    );

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        feedback,
        setFeedback,
    ] = useState<{
        type:
            | 'success'
            | 'error';
        message: string;
    } | null>(null);

    type LivenessStep =
        | 'DETECT'
        | 'CENTER'
        | 'BLINK'
        | 'TURN'
        | 'SMILE'
        | 'PASSED';

    const [
        livenessStep,
        setLivenessStep,
    ] =
        useState<LivenessStep>(
            'DETECT',
        );

    const blinkStarted =
        useRef(false);

    /*
    |--------------------------------------------------------------------------
    | CAMERA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let stream:
            | MediaStream
            | null = null;

        let cancelled = false;

        async function startCamera() {
            try {
                stream =
                    await navigator.mediaDevices.getUserMedia(
                        {
                            video: {
                                facingMode:
                                    'user',

                                width: {
                                    ideal: 1280,
                                },

                                height: {
                                    ideal: 720,
                                },
                            },

                            audio: false,
                        },
                    );

                if (
                    cancelled ||
                    !videoRef.current
                ) {
                    return;
                }

                videoRef.current.srcObject =
                    stream;

                await videoRef.current.play();

                setCameraReady(true);

                const {
                    FaceLandmarker,
                    FilesetResolver,
                } = await import(
                    '@mediapipe/tasks-vision'
                );

                const vision =
                    await FilesetResolver.forVisionTasks(
                        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
                    );

                faceLandmarkerRef.current =
                    await FaceLandmarker.createFromOptions(
                        vision,
                        {
                            baseOptions: {
                                modelAssetPath:
                                    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',

                                delegate:
                                    'GPU',
                            },

                            runningMode:
                                'VIDEO',

                            numFaces: 1,

                            minFaceDetectionConfidence:
                                0.5,

                            minFacePresenceConfidence:
                                0.5,

                            minTrackingConfidence:
                                0.5,
                        },
                    );
            } catch (error) {
                console.error(error);

                setCameraError(
                    'Unable to access camera. Please allow camera permission.',
                );
            }
        }

        startCamera();

        return () => {
            cancelled = true;

            stream
                ?.getTracks()
                .forEach(
                    (track) =>
                        track.stop(),
                );

            faceLandmarkerRef.current?.close?.();

            if (
                animationFrameRef.current !==
                null
            ) {
                cancelAnimationFrame(
                    animationFrameRef.current,
                );
            }
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | LOCATION
    |--------------------------------------------------------------------------
    */

    const requestLocation = () => {
        setLocationLoading(true);

        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude:
                        position.coords
                            .latitude,

                    longitude:
                        position.coords
                            .longitude,

                    accuracy:
                        position.coords
                            .accuracy,
                });

                setLocationLoading(false);
            },

            () => {
                setLocationLoading(false);

                setLocationError(
                    'Unable to retrieve location. Please allow location access.',
                );
            },

            {
                enableHighAccuracy:
                    true,

                timeout: 15000,

                maximumAge: 0,
            },
        );
    };

    useEffect(() => {
        requestLocation();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | LIVENESS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !cameraReady ||
            livenessStep ===
                'PASSED'
        ) {
            return;
        }

        let stopped = false;

        const eyeAspectRatio = (
            landmarks: any[],
            ids: number[],
        ) => {
            const p =
                ids.map(
                    (index) =>
                        landmarks[
                            index
                        ],
                );

            if (
                p.some(
                    (point) =>
                        !point,
                )
            ) {
                return 0;
            }

            const v1 =
                Math.hypot(
                    p[1].x -
                        p[5].x,

                    p[1].y -
                        p[5].y,
                );

            const v2 =
                Math.hypot(
                    p[2].x -
                        p[4].x,

                    p[2].y -
                        p[4].y,
                );

            const horizontal =
                Math.hypot(
                    p[0].x -
                        p[3].x,

                    p[0].y -
                        p[3].y,
                );

            return horizontal ===
                0
                ? 0
                : (v1 + v2) /
                      (2 *
                          horizontal);
        };

        const detect = () => {
            if (stopped) {
                return;
            }

            const video =
                videoRef.current;

            const detector =
                faceLandmarkerRef.current;

            if (
                !video ||
                video.readyState <
                    2 ||
                !detector
            ) {
                animationFrameRef.current =
                    requestAnimationFrame(
                        detect,
                    );

                return;
            }

            const result =
                detector.detectForVideo(
                    video,
                    performance.now(),
                );

            const landmarks =
                result
                    .faceLandmarks?.[0];

            if (!landmarks) {
                setLivenessStep(
                    'DETECT',
                );

                animationFrameRef.current =
                    requestAnimationFrame(
                        detect,
                    );

                return;
            }

            const leftEAR =
                eyeAspectRatio(
                    landmarks,
                    [
                        33,
                        160,
                        158,
                        133,
                        153,
                        144,
                    ],
                );

            const rightEAR =
                eyeAspectRatio(
                    landmarks,
                    [
                        362,
                        385,
                        387,
                        263,
                        373,
                        380,
                    ],
                );

            const ear =
                (leftEAR +
                    rightEAR) /
                2;

            const nose =
                landmarks[1];

            const faceLeft =
                landmarks[234];

            const faceRight =
                landmarks[454];

            const dl =
                Math.abs(
                    nose.x -
                        faceLeft.x,
                );

            const dr =
                Math.abs(
                    nose.x -
                        faceRight.x,
                );

            const yaw =
                dl + dr === 0
                    ? 0
                    : (dl - dr) /
                      (dl + dr);

            const mouthTop =
                landmarks[13];

            const mouthBottom =
                landmarks[14];

            const mouthLeft =
                landmarks[78];

            const mouthRight =
                landmarks[308];

            const mouthRatio =
                Math.hypot(
                    mouthTop.x -
                        mouthBottom.x,

                    mouthTop.y -
                        mouthBottom.y,
                ) /
                Math.max(
                    0.0001,

                    Math.hypot(
                        mouthLeft.x -
                            mouthRight.x,

                        mouthLeft.y -
                            mouthRight.y,
                    ),
                );

            if (
                livenessStep ===
                'DETECT'
            ) {
                setLivenessStep(
                    'CENTER',
                );
            } else if (
                livenessStep ===
                    'CENTER' &&
                Math.abs(yaw) <
                    0.15
            ) {
                setLivenessStep(
                    'BLINK',
                );
            } else if (
                livenessStep ===
                'BLINK'
            ) {
                if (
                    ear < 0.18
                ) {
                    blinkStarted.current =
                        true;
                }

                if (
                    blinkStarted.current &&
                    ear > 0.22
                ) {
                    blinkStarted.current =
                        false;

                    setLivenessStep(
                        'TURN',
                    );
                }
            } else if (
                livenessStep ===
                    'TURN' &&
                Math.abs(yaw) >
                    0.28
            ) {
                setLivenessStep(
                    'SMILE',
                );
            } else if (
                livenessStep ===
                    'SMILE' &&
                mouthRatio > 0.32
            ) {
                setLivenessStep(
                    'PASSED',
                );
            }

            animationFrameRef.current =
                requestAnimationFrame(
                    detect,
                );
        };

        detect();

        return () => {
            stopped = true;
        };
    }, [
        cameraReady,
        livenessStep,
    ]);

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submitAttendance =
        () => {
            if (
                !videoRef.current ||
                !location ||
                livenessStep !==
                    'PASSED'
            ) {
                return;
            }

            if (
                location.accuracy >
                100
            ) {
                setFeedback({
                    type: 'error',

                    message:
                        `GPS accuracy is ±${Math.round(
                            location.accuracy,
                        )}m. Wait for a better location reading.`,
                });

                requestLocation();

                return;
            }

            setSubmitting(true);

            const canvas =
                canvasRef.current;

            if (!canvas) {
                return;
            }

            const video =
                videoRef.current;

            canvas.width =
                video.videoWidth ||
                1280;

            canvas.height =
                video.videoHeight ||
                720;

            const ctx =
                canvas.getContext(
                    '2d',
                );

            if (!ctx) {
                return;
            }

            ctx.save();

            ctx.translate(
                canvas.width,
                0,
            );

            ctx.scale(-1, 1);

            ctx.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height,
            );

            ctx.restore();

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        setSubmitting(false);

                        return;
                    }

                    const formData =
                        new FormData();

                    formData.append(
                        'event_id',
                        String(
                            event.event_id,
                        ),
                    );

                    formData.append(
                        'live_camera_frame',
                        blob,
                        'attendance.jpg',
                    );

                    formData.append(
                        'latitude',
                        String(
                            location.latitude,
                        ),
                    );

                    formData.append(
                        'longitude',
                        String(
                            location.longitude,
                        ),
                    );

                    formData.append(
                        'location_accuracy',
                        String(
                            location.accuracy,
                        ),
                    );

                    formData.append(
                        'liveness_passed',
                        '1',
                    );

                    router.post(
                        '/attendance/check-in',

                        formData,

                        {
                            forceFormData:
                                true,

                            preserveScroll:
                                true,

                            onSuccess:
                                () => {
                                    setFeedback({
                                        type:
                                            'success',

                                        message:
                                            'Attendance recorded successfully.',
                                    });

                                    setTimeout(
                                        () =>
                                            onClose(),
                                        1800,
                                    );
                                },

                            onError:
                                (
                                    errors: any,
                                ) => {
                                    const message =
                                        errors.attendance ||
                                        errors.latitude ||
                                        errors.longitude ||
                                        errors.live_camera_frame ||
                                        Object.values(
                                            errors,
                                        )[0];

                                    setFeedback({
                                        type:
                                            'error',

                                        message:
                                            typeof message ===
                                            'string'
                                                ? message
                                                : 'Attendance verification failed.',
                                    });
                                },

                            onFinish:
                                () =>
                                    setSubmitting(
                                        false,
                                    ),
                        },
                    );
                },

                'image/jpeg',

                0.95,
            );
        };

    const steps: Record<
        LivenessStep,
        string
    > = {
        DETECT:
            'Position your face in the frame',

        CENTER:
            'Look straight at the camera',

        BLINK:
            'Blink once',

        TURN:
            'Turn your head left or right',

        SMILE:
            'Smile',

        PASSED:
            'Liveness passed',
    };

    const ready =
        cameraReady &&
        !!location &&
        livenessStep ===
            'PASSED';

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:flex sm:items-center sm:justify-center">

            <div className="mx-auto my-4 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#090E1C]">

                <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">

                    <div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D39A2C]">
                            Record Attendance
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                            {event.title}
                        </h2>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>

                <div className="p-5 sm:p-6">

                    <div className="relative mx-auto aspect-[4/5] max-h-[420px] w-full max-w-[330px] overflow-hidden rounded-3xl bg-black">

                        <video
                            ref={
                                videoRef
                            }
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full -scale-x-100 object-cover"
                        />

                        <div className="pointer-events-none absolute inset-[12%] rounded-[45%] border-2 border-dashed border-[#D39A2C]" />

                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">

                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            Face verification
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {
                                steps[
                                    livenessStep
                                ]
                            }
                        </p>

                    </div>

                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">

                        {locationLoading ? (

                            <div className="flex items-center gap-2 text-xs text-slate-500">

                                <RefreshCw className="h-4 w-4 animate-spin" />

                                Checking location...

                            </div>

                        ) : locationError ? (

                            <div className="text-xs text-red-600">

                                {
                                    locationError
                                }

                            </div>

                        ) : location ? (

                            <div className="flex items-center gap-2 text-xs text-emerald-600">

                                <MapPin className="h-4 w-4" />

                                Location ready · ±
                                {Math.round(
                                    location.accuracy,
                                )}
                                m

                            </div>

                        ) : null}

                    </div>

                    {cameraError && (
                        <div className="mt-3 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">

                            <AlertCircle className="h-4 w-4" />

                            {
                                cameraError
                            }

                        </div>
                    )}

                    {feedback && (
                        <div
                            className={`mt-3 flex gap-2 rounded-xl border p-3 text-xs ${
                                feedback.type ===
                                'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-red-200 bg-red-50 text-red-600'
                            }`}
                        >

                            {feedback.type ===
                            'success' ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}

                            {
                                feedback.message
                            }

                        </div>
                    )}

                    <button
                        type="button"
                        onClick={
                            submitAttendance
                        }
                        disabled={
                            !ready ||
                            submitting
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#121A3A] py-3.5 text-sm font-bold text-white disabled:opacity-40"
                    >

                        {submitting ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />

                                Verifying...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-4 w-4" />

                                Verify & Record
                            </>
                        )}

                    </button>

                </div>

                <canvas
                    ref={canvasRef}
                    className="hidden"
                />

            </div>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getInitials(
    name: string,
) {
    const parts =
        name
            .trim()
            .split(/\s+/);

    if (
        parts.length ===
        1
    ) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    ).toUpperCase();
}

function formatTime(
    value?: string | null,
) {
    if (!value) {
        return '';
    }

    const [
        hour,
        minute,
    ] =
        value.split(':');

    const date =
        new Date();

    date.setHours(
        Number(hour),
        Number(minute),
        0,
    );

    return date.toLocaleTimeString(
        [],
        {
            hour: 'numeric',
            minute: '2-digit',
        },
    );
}

function formatDate(
    value: string,
) {
    return new Date(
        value,
    ).toLocaleDateString(
        undefined,
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        },
    );
}

function formatDateTime(
    value: string,
) {
    return new Date(
        value,
    ).toLocaleString(
        undefined,
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        },
    );
}