import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type StudentProps = {
    student_id: number;
    firstname: string;
    surname: string;
    face_embedding: { x: number; y: number }[] | null;
};

type Props = {
    student: StudentProps;
};

// ============================================================================
// HELPER: Symmetrical Interocular Scale Normalized Distance Calculation
// ============================================================================
function calculateFaceDistance(
    refPoints: { x: number; y: number }[],
    livePoints: { x: number; y: number }[]
): number {
    if (!refPoints || !livePoints || refPoints.length !== livePoints.length) {
        return 999;
    }

    // MediaPipe 6-point layout: 0 = Right Eye, 1 = Left Eye
    const normalizePoints = (points: { x: number; y: number }[]) => {
        const rightEye = points[0];
        const leftEye = points[1];

        // Compute Interocular Distance (IOD)
        const iod = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y) || 1;

        // Origin offset set to the midpoint between both eyes
        const midX = (rightEye.x + leftEye.x) / 2;
        const midY = (rightEye.y + leftEye.y) / 2;

        return points.map((p) => ({
            x: (p.x - midX) / iod,
            y: (p.y - midY) / iod,
        }));
    };

    const normRef = normalizePoints(refPoints);
    const normLive = normalizePoints(livePoints);

    // Compute Root Mean Square (RMS) Distance across points
    let totalDist = 0;
    for (let i = 0; i < normRef.length; i++) {
        const dx = normRef[i].x - normLive[i].x;
        const dy = normRef[i].y - normLive[i].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
    }

    return totalDist / normRef.length;
}

export default function VerifyFace({ student }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [streamStarted, setStreamStarted] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [matchStatus, setMatchStatus] = useState<'scanning' | 'matched' | 'failed'>('scanning');
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize Webcam Feed
    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStreamStarted(true);
                }
            } catch (err) {
                console.error('Webcam access error:', err);
                setCameraError('Unable to access webcam. Please allow camera permissions in your browser.');
            }
        }

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Perform Facial Landmark Capture & Verification Scan
    const handleScanAndVerify = async () => {
        if (!videoRef.current || !student?.face_embedding) {
            setCameraError('Missing reference facial keypoints. Please contact support.');
            return;
        }

        const video = videoRef.current;
        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks('/mediapipe');
        
        const detector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: '/mediapipe/blaze_face_short_range.tflite',
                delegate: 'GPU',
            },
            runningMode: 'IMAGE',
            minDetectionConfidence: 0.65,
        });

        // Capture current frame to hidden canvas
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Run MediaPipe Face Detection on video frame
        const result = detector.detect(canvas);

        if (!result.detections || result.detections.length === 0) {
            setMatchStatus('failed');
            setCameraError('No face detected in webcam view. Look directly into the camera.');
            return;
        }

        if (result.detections.length > 1) {
            setMatchStatus('failed');
            setCameraError('Multiple faces detected in frame. Ensure you are alone in view.');
            return;
        }

        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;

        // FIX: Flip X coordinate back (1 - rawX) to match unmirrored registration photo
        const liveKeypoints = result.detections[0].keypoints.map((kp: any) => {
            const rawX = kp.x > 1 ? kp.x / videoWidth : kp.x;
            const rawY = kp.y > 1 ? kp.y / videoHeight : kp.y;

            return {
                x: Number((1 - rawX).toFixed(4)),
                y: Number(rawY.toFixed(4)),
            };
        });

        // Compute Structural Distance
        const distance = calculateFaceDistance(student.face_embedding, liveKeypoints);
        
        // Calibrated 0% - 100% Similarity Formula
        const similarityPct = Math.max(0, Math.min(100, Math.round((1 - (distance * 1.8)) * 100)));
        setMatchScore(similarityPct);

        // Threshold adjusted to <= 0.22 for realistic webcam/photo matching
        if (distance <= 0.22) {
            setMatchStatus('matched');
            setCameraError(null);
            setIsSubmitting(true);

            setTimeout(() => {
                router.post('/register/verify-face');
            }, 1200);
        } else {
            setMatchStatus('failed');
            setCameraError(`Face match failed (${similarityPct}% match). Face structure does not match the uploaded reference photo.`);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F6FA] p-4 font-sans text-black">
            <Head title="Live Face Verification" />

            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B1F5C]/10 text-[#1B1F5C]">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1B1F5C]">Step 2: Live Face Verification</h2>
                    <p className="mt-1 text-xs text-gray-500">
                        Hello <span className="font-semibold text-gray-800">{student.firstname}</span>, match your face with your reference photo to complete registration.
                    </p>
                </div>

                {/* Video Container */}
                <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full border-4 border-[#1B1F5C] bg-black shadow-inner">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover -scale-x-100"
                    />

                    {/* Circular Alignment Overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-dashed border-[#F5A623]/60" />

                    {!streamStarted && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
                            <RefreshCw className="h-6 w-6 animate-spin text-[#F5A623]" />
                            <p className="mt-2 text-xs">Initializing Camera...</p>
                        </div>
                    )}
                </div>

                {/* Status Alert Messages */}
                {cameraError && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{cameraError}</span>
                    </div>
                )}

                {matchStatus === 'matched' && (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Identity Verified ({matchScore}% Match)! Redirecting...</span>
                    </div>
                )}

                {/* Scan Button */}
                <div className="mt-6 flex flex-col gap-3">
                    <Button
                        onClick={handleScanAndVerify}
                        disabled={!streamStarted || isSubmitting || matchStatus === 'matched'}
                        className="w-full rounded-lg bg-[#1B1F5C] py-2.5 font-medium text-white shadow-md hover:bg-[#131644]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Completing Registration...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Camera className="h-4 w-4 text-[#F5A623]" />
                                Scan & Verify Face
                            </span>
                        )}
                    </Button>
                </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

VerifyFace.layout = {
    title: 'Live Face Verification',
};