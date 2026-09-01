import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRightLeft,
    CheckCircle2,
    Eye,
    RefreshCw,
    Scan,
    ShieldAlert,
    ShieldCheck,
    Smile,
    Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type StudentProps = {
    student_id: number;
    firstname: string;
    surname: string;
};

type Props = {
    student: StudentProps;
};

type LivenessStep =
    | 'DETECT'
    | 'LOOK_CENTER'
    | 'BLINK'
    | 'HEAD_TURN'
    | 'SMILE'
    | 'VERIFYING'
    | 'PASSED';

const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];

const NOSE_TIP = 1;
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;

const UPPER_LIP = 13;
const LOWER_LIP = 14;
const MOUTH_LEFT = 78;
const MOUTH_RIGHT = 308;

function calculateEAR(landmarks: any[], indices: number[]): number {
    const points = indices.map((index) => landmarks[index]);
    if (points.some((point) => !point)) return 0;

    const vertical1 = Math.hypot(points[1].x - points[5].x, points[1].y - points[5].y);
    const vertical2 = Math.hypot(points[2].x - points[4].x, points[2].y - points[4].y);
    const horizontal = Math.hypot(points[0].x - points[3].x, points[0].y - points[3].y);

    return horizontal === 0 ? 0 : (vertical1 + vertical2) / (2 * horizontal);
}

function calculateYaw(landmarks: any[]): number {
    const nose = landmarks[NOSE_TIP];
    const left = landmarks[LEFT_CHEEK];
    const right = landmarks[RIGHT_CHEEK];
    if (!nose || !left || !right) return 0;

    const distanceLeft = Math.abs(nose.x - left.x);
    const distanceRight = Math.abs(nose.x - right.x);
    const total = distanceLeft + distanceRight;

    return total === 0 ? 0 : (distanceLeft - distanceRight) / total;
}

function calculateMAR(landmarks: any[]): number {
    const top = landmarks[UPPER_LIP];
    const bottom = landmarks[LOWER_LIP];
    const left = landmarks[MOUTH_LEFT];
    const right = landmarks[MOUTH_RIGHT];

    if (!top || !bottom || !left || !right) return 0;

    const vertical = Math.hypot(top.x - bottom.x, top.y - bottom.y);
    const horizontal = Math.hypot(left.x - right.x, left.y - right.y);

    return horizontal === 0 ? 0 : vertical / horizontal;
}

export default function VerifyFace({ student }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestRef = useRef<number | null>(null);
    const faceLandmarkerRef = useRef<any>(null);

    const [streamStarted, setStreamStarted] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null); // State for Pop-Up Error Modal
    const [currentStep, setCurrentStep] = useState<LivenessStep>('DETECT');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isBlinkingRef = useRef(false);
    const hasSubmittedRef = useRef(false);

    // Shut down webcam hardware and turn off indicator light
    const stopCameraStream = () => {
        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }

        setStreamStarted(false);
    };

    // Restart camera if validation fails and user retries
    const startCameraStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
                setStreamStarted(true);
            }
        } catch (error) {
            console.error('Re-starting camera failed:', error);
            setCameraError('Unable to access camera.');
        }
    };

    // Handle user closing error modal to retry verification
    const handleCloseModalAndRetry = () => {
        setModalError(null);
        setCameraError(null);
        setIsSubmitting(false);
        hasSubmittedRef.current = false;
        setCurrentStep('DETECT');
        startCameraStream();
    };

    // Initialise Camera and MediaPipe
    useEffect(() => {
        let isMounted = true;

        async function initialize() {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera access is not supported by this browser.');
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                    audio: false,
                });

                if (!isMounted) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => {});
                    setStreamStarted(true);
                }

                const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                const landmarker = await FaceLandmarker.createFromOptions(vision, {
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

                if (isMounted) {
                    faceLandmarkerRef.current = landmarker;
                }
            } catch (error) {
                console.error('Face verification initialization error:', error);
                if (isMounted) {
                    setCameraError('Unable to initialize the camera or facial recognition system.');
                }
            }
        }

        initialize();

        return () => {
            isMounted = false;
            stopCameraStream();

            if (faceLandmarkerRef.current?.close) {
                faceLandmarkerRef.current.close();
            }
        };
    }, []);

    // Liveness Detection Loop
    useEffect(() => {
        if (!streamStarted || currentStep === 'VERIFYING' || currentStep === 'PASSED' || modalError !== null) return;

        let stopped = false;

        const detectFrame = () => {
            if (stopped) return;

            const video = videoRef.current;
            const landmarker = faceLandmarkerRef.current;

            if (!video || video.readyState < 2 || !landmarker) {
                requestRef.current = requestAnimationFrame(detectFrame);
                return;
            }

            try {
                const results = landmarker.detectForVideo(video, performance.now());

                if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
                    setCurrentStep('DETECT');
                    isBlinkingRef.current = false;
                    requestRef.current = requestAnimationFrame(detectFrame);
                    return;
                }

                if (results.faceLandmarks.length > 1) {
                    setCameraError('Only one face should be visible in the camera.');
                    requestRef.current = requestAnimationFrame(detectFrame);
                    return;
                }

                setCameraError(null);
                const landmarks = results.faceLandmarks[0];

                const leftEAR = calculateEAR(landmarks, LEFT_EYE);
                const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
                const averageEAR = (leftEAR + rightEAR) / 2;
                const yaw = calculateYaw(landmarks);
                const mar = calculateMAR(landmarks);

                if (!Number.isFinite(averageEAR) || averageEAR <= 0) {
                    requestRef.current = requestAnimationFrame(detectFrame);
                    return;
                }

                // Step 1: Detect
                if (currentStep === 'DETECT') {
                    setCurrentStep('LOOK_CENTER');
                }
                // Step 2: Look Center
                else if (currentStep === 'LOOK_CENTER') {
                    if (Math.abs(yaw) < 0.15 && averageEAR > 0.20) {
                        setCurrentStep('BLINK');
                    }
                }
                // Step 3: Blink
                else if (currentStep === 'BLINK') {
                    if (averageEAR < 0.18) {
                        isBlinkingRef.current = true;
                    } else if (isBlinkingRef.current && averageEAR >= 0.22) {
                        isBlinkingRef.current = false;
                        setCurrentStep('HEAD_TURN');
                    }
                }
                // Step 4: Turn Head
                else if (currentStep === 'HEAD_TURN') {
                    if (Math.abs(yaw) > 0.30) {
                        setCurrentStep('SMILE');
                    }
                }
                // Step 5: Smile -> Trigger Auto Capture
                else if (currentStep === 'SMILE') {
                    if (mar > 0.35) {
                        if (!hasSubmittedRef.current) {
                            hasSubmittedRef.current = true;
                            setCurrentStep('VERIFYING');
                            handleCaptureAndVerify();
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Face detection error:', error);
            }

            requestRef.current = requestAnimationFrame(detectFrame);
        };

        requestRef.current = requestAnimationFrame(detectFrame);

        return () => {
            stopped = true;
            if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        };
    }, [streamStarted, currentStep, modalError]);

    // Send Live Snapshot Frame to Laravel & Shut Down Camera
    const handleCaptureAndVerify = async () => {
        if (!videoRef.current) {
            hasSubmittedRef.current = false;
            setCurrentStep('DETECT');
            return;
        }

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current || document.createElement('canvas');
            const width = video.videoWidth || 1280;
            const height = video.videoHeight || 720;

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');
            if (!context) throw new Error('Unable to create camera canvas.');

            // Mirror image orientation
            context.save();
            context.translate(width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, width, height);
            context.restore();

            const liveCameraBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
            });

            if (!liveCameraBlob) throw new Error('Unable to capture camera image.');

            // Close hardware track and turn off indicator light
            stopCameraStream();

            const formData = new FormData();
            formData.append('live_camera_frame', liveCameraBlob, 'live-camera.jpg');
            formData.append('student_id', String(student.student_id));

            setIsSubmitting(true);

            router.post('/register/verify-face', formData, {
                forceFormData: true,
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const pageErrors = (page.props as any).errors || {};

                    if (Object.keys(pageErrors).length > 0) {
                        const errorMessage =
                            pageErrors.face ||
                            pageErrors.live_camera_frame ||
                            Object.values(pageErrors)[0] ||
                            'Face mismatch detected! The face in front of the camera does not match your profile photo.';

                        setIsSubmitting(false);
                        setModalError(errorMessage as string);
                        return;
                    }

                    setIsSubmitting(false);
                    setCurrentStep('PASSED');
                },
                onError: (errors: Record<string, any>) => {
                    console.error('Face verification errors:', errors);
                    const message =
                        errors.face ||
                        errors.live_camera_frame ||
                        errors.verification ||
                        Object.values(errors)[0] ||
                        'Face mismatch detected! The face in front of the camera does not match your profile photo.';

                    setIsSubmitting(false);
                    setModalError(message);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Camera capture error:', error);
            setIsSubmitting(false);
            setModalError('Unable to capture camera image properly. Please try again.');
        }
    };

    const getStepInstruction = () => {
        switch (currentStep) {
            case 'DETECT':
                return { text: '1. Position your face inside the circle', icon: Scan };
            case 'LOOK_CENTER':
                return { text: '2. Look directly at the camera', icon: Eye };
            case 'BLINK':
                return { text: '3. Blink BOTH eyes naturally', icon: Eye };
            case 'HEAD_TURN':
                return { text: '4. Turn your head LEFT or RIGHT', icon: ArrowRightLeft };
            case 'SMILE':
                return { text: '5. Smile or open your mouth slightly', icon: Smile };
            case 'VERIFYING':
                return { text: '6. Verifying biometrics with Python AI service...', icon: RefreshCw };
            case 'PASSED':
                return { text: '7. Verification successful! Redirecting...', icon: CheckCircle2 };
        }
    };

    const { text: instructionText, icon: ActiveIcon } = getStepInstruction();

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#F5F6FA] p-4 font-sans text-black">
            <Head title="Live Face Verification" />

            {/* PROCESSING OVERLAY */}
            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 text-white backdrop-blur-sm">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/10 p-4">
                        <Sparkles className="h-12 w-12 animate-pulse text-[#F5A623]" />
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#F5A623]" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">Registering Biometrics...</h3>
                    <p className="mt-1 text-xs text-gray-300">Extracting InsightFace 512-D vector...</p>
                </div>
            )}

            {/* ERROR POP-UP MODAL */}
            {modalError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-2xl text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <ShieldAlert className="h-8 w-8 animate-bounce" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Verification Failed</h3>
                        <p className="mt-2 text-xs leading-relaxed text-gray-600 font-medium">
                            {modalError}
                        </p>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleCloseModalAndRetry}
                                className="w-full rounded-xl bg-[#1B1F5C] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#131644] active:scale-95"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CARD */}
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
                <div className="mb-4 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B1F5C]/10 text-[#1B1F5C]">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1B1F5C]">Biometric Registration</h2>
                    <p className="mt-1 text-xs text-gray-500">
                        Welcome <span className="font-semibold text-gray-800">{student.firstname}</span>, complete active liveness verification.
                    </p>
                </div>

                {/* CAMERA VIEWPORT */}
                <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full border-4 border-[#1B1F5C] bg-black shadow-inner">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full scale-x-[-1] object-cover"
                    />
                    <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-full border border-white/20">
                        <div
                            className={`h-full w-full rounded-full border-2 border-dashed transition-colors duration-300 ${
                                currentStep === 'PASSED'
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : currentStep === 'VERIFYING'
                                      ? 'animate-spin border-[#F5A623]'
                                      : 'animate-pulse border-[#F5A623]'
                            }`}
                        />
                    </div>
                </div>

                {/* STEP BADGE */}
                <div
                    className={`mt-6 flex items-center justify-center gap-2 rounded-lg border p-3 text-center text-xs font-semibold ${
                        currentStep === 'PASSED'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                >
                    <ActiveIcon className="h-4 w-4 shrink-0 animate-pulse" />
                    <span>{instructionText}</span>
                </div>

                {/* HARDWARE/SYSTEM ERROR BOX */}
                {cameraError && !modalError && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{cameraError}</span>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

VerifyFace.layout = {
    title: 'Biometric Face Registration',
};