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
    late_after_minutes?: number;
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

function CheckInModal({ event, onClose }: { event: Event; onClose: () => void }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestRef = useRef<number | null>(null);
    const faceLandmarkerRef = useRef<any>(null);

    const [streamStarted, setStreamStarted] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [locationError, setLocationError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);

    type LivenessStep = 'DETECT' | 'CENTER' | 'BLINK' | 'TURN' | 'SMILE' | 'PASSED';
    const [livenessStep, setLivenessStep] = useState<LivenessStep>('DETECT');
    const blinkStartedRef = useRef(false);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            setLocationError('Geolocation is not supported by this browser.');
            return;
        }
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            p => {
                setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy });
                setLocationStatus('ready');
                setLocationError(null);
            },
            e => {
                setLocationStatus('error');
                setLocationError(e.code === e.PERMISSION_DENIED ? 'Location permission was denied.' : 'Unable to determine your location.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
    };

    useEffect(() => {
        let mounted = true;
        let activeStream: MediaStream | null = null;

        async function initialize() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                    audio: false,
                });
                activeStream = stream;
                if (videoRef.current && mounted) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => {});
                    setStreamStarted(true);
                }

                const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
                const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
                faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                    minFaceDetectionConfidence: 0.5,
                    minFacePresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });
            } catch (e) {
                if (mounted) setCameraError('Unable to initialize camera or MediaPipe.');
            }
        }

        initialize();
        requestLocation();

        return () => {
            mounted = false;
            activeStream?.getTracks().forEach(track => track.stop());
            if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
            faceLandmarkerRef.current?.close?.();
        };
    }, []);

    useEffect(() => {
        if (!streamStarted || livenessStep === 'PASSED') return;
        let stopped = false;

        const eye = (lm: any[], ids: number[]) => {
            const p = ids.map(i => lm[i]);
            if (p.some(x => !x)) return 0;
            const v1 = Math.hypot(p[1].x-p[5].x, p[1].y-p[5].y);
            const v2 = Math.hypot(p[2].x-p[4].x, p[2].y-p[4].y);
            const h = Math.hypot(p[0].x-p[3].x, p[0].y-p[3].y);
            return h === 0 ? 0 : (v1+v2)/(2*h);
        };
        const loop = () => {
            if (stopped) return;
            const video = videoRef.current;
            const landmarker = faceLandmarkerRef.current;
            if (!video || video.readyState < 2 || !landmarker) {
                requestRef.current = requestAnimationFrame(loop); return;
            }
            try {
                const results = landmarker.detectForVideo(video, performance.now());
                const lm = results.faceLandmarks?.[0];
                if (!lm) { setLivenessStep('DETECT'); blinkStartedRef.current = false; requestRef.current = requestAnimationFrame(loop); return; }
                const ear = (eye(lm,[33,160,158,133,153,144]) + eye(lm,[362,385,387,263,373,380]))/2;
                const nose=lm[1], left=lm[234], right=lm[454];
                const dl=Math.abs(nose.x-left.x), dr=Math.abs(nose.x-right.x);
                const yaw=(dl+dr)===0?0:(dl-dr)/(dl+dr);
                const top=lm[13], bottom=lm[14], ml=lm[78], mr=lm[308];
                const mar=Math.hypot(top.x-bottom.x,top.y-bottom.y)/Math.max(0.0001,Math.hypot(ml.x-mr.x,ml.y-mr.y));

                if (livenessStep === 'DETECT') setLivenessStep('CENTER');
                else if (livenessStep === 'CENTER' && Math.abs(yaw) < 0.15 && ear > 0.20) setLivenessStep('BLINK');
                else if (livenessStep === 'BLINK') {
                    if (ear < 0.18) blinkStartedRef.current = true;
                    else if (blinkStartedRef.current && ear >= 0.22) { blinkStartedRef.current=false; setLivenessStep('TURN'); }
                }
                else if (livenessStep === 'TURN' && Math.abs(yaw) > 0.30) setLivenessStep('SMILE');
                else if (livenessStep === 'SMILE' && mar > 0.35) setLivenessStep('PASSED');
            } catch (e) { console.error(e); }
            requestRef.current = requestAnimationFrame(loop);
        };
        requestRef.current = requestAnimationFrame(loop);
        return () => { stopped = true; if (requestRef.current !== null) cancelAnimationFrame(requestRef.current); };
    }, [streamStarted, livenessStep]);

    const livenessText: Record<LivenessStep,string> = {
        DETECT: 'Position one face in the frame',
        CENTER: 'Look straight at the camera',
        BLINK: 'Blink once',
        TURN: 'Turn your head left or right',
        SMILE: 'Smile to finish liveness',
        PASSED: 'Liveness passed',
    };

    const handleScanAttendance = async () => {
        if (!videoRef.current || !userLocation || livenessStep !== 'PASSED') return;
        if (userLocation.accuracy > 100) {
            setFeedbackMessage({ type:'error', text:`GPS accuracy is ±${Math.round(userLocation.accuracy)} m. Wait for a better reading.` });
            requestLocation(); return;
        }

        setIsScanning(true); setFeedbackMessage(null);
        const video=videoRef.current;
        const canvas=canvasRef.current || document.createElement('canvas');
        canvas.width=video.videoWidth || 1280; canvas.height=video.videoHeight || 720;
        const ctx=canvas.getContext('2d');
        if (!ctx) { setIsScanning(false); return; }
        ctx.save(); ctx.translate(canvas.width,0); ctx.scale(-1,1); ctx.drawImage(video,0,0,canvas.width,canvas.height); ctx.restore();

        canvas.toBlob(blob => {
            if (!blob) { setFeedbackMessage({type:'error',text:'Failed to capture camera frame.'}); setIsScanning(false); return; }
            const formData=new FormData();
            formData.append('event_id',String(event.event_id));
            formData.append('live_camera_frame',blob,'attendance-scan.jpg');
            formData.append('latitude',String(userLocation.latitude));
            formData.append('longitude',String(userLocation.longitude));
            formData.append('location_accuracy',String(userLocation.accuracy));
            formData.append('liveness_passed','1');

            router.post('/attendance/check-in',formData,{
                forceFormData:true,
                preserveScroll:true,
                onSuccess:()=>{ setFeedbackMessage({type:'success',text:'Attendance verified and recorded!'}); setIsScanning(false); },
                onError:(errors:any)=>{ setFeedbackMessage({type:'error',text:errors.attendance||errors.latitude||errors.longitude||errors.liveness_passed||errors.live_camera_frame||'Attendance verification failed.'}); setIsScanning(false); },
                onFinish:()=>setIsScanning(false),
            });
        },'image/jpeg',0.95);
    };

    const ready = streamStarted && locationStatus === 'ready' && livenessStep === 'PASSED';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white text-gray-900 shadow-2xl dark:border-slate-800 dark:bg-[#090d16] dark:text-white">
                <div className="relative border-b border-gray-100 px-6 pb-4 pt-6 dark:border-slate-800">
                    <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-gray-400"><X className="h-5 w-5"/></button>
                    <h2 className="pr-8 text-lg font-bold">{event.title}</h2>
                    <p className="mt-1 text-xs text-gray-500">{event.event_date} · {formatEventTime(event.start_time,event.end_time)} · {event.location||'Location TBA'}</p>
                </div>
                <div className="flex flex-col items-center px-6 py-6">
                    <div className="relative h-52 w-52 overflow-hidden rounded-full border-4 border-[#1B1F5C] bg-black dark:border-amber-400">
                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover -scale-x-100"/>
                        {!streamStarted && !cameraError && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><RefreshCw className="h-6 w-6 animate-spin text-white"/></div>}
                    </div>
                    <p className={`mt-3 text-sm font-semibold ${livenessStep==='PASSED'?'text-emerald-600':'text-indigo-700'}`}>{livenessText[livenessStep]}</p>

                    <div className="mt-4 w-full rounded-lg border p-3 text-xs">
                        {locationStatus==='loading' && 'Checking location...'}
                        {locationStatus==='error' && <><span className="text-red-600">{locationError}</span><button onClick={requestLocation} className="ml-2 underline">Retry</button></>}
                        {locationStatus==='ready' && userLocation && <span className="text-emerald-600">Location acquired · accuracy ±{Math.round(userLocation.accuracy)} m</span>}
                    </div>

                    {feedbackMessage && <div className={`mt-4 w-full rounded-lg border p-3 text-xs ${feedbackMessage.type==='success'?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-red-200 bg-red-50 text-red-600'}`}>{feedbackMessage.text}</div>}

                    <button onClick={handleScanAttendance} disabled={isScanning || !ready} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{backgroundColor:isScanning?GOLD_DARK:GOLD}}>
                        {isScanning?<><RefreshCw className="h-4 w-4 animate-spin"/>Verifying...</>:<><Camera className="h-4 w-4"/>Scan to check in</>}
                    </button>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden"/>
        </div>
    );
}
