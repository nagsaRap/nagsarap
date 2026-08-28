// resources/js/lib/faceValidation.ts

// ============================================================================
// ⚙️ FACE VALIDATION CONFIGURATION
// ============================================================================
export const FACE_VAL_CONFIG = {
    BLUR_THRESHOLD: 60,
    MIN_DETECTION_CONFIDENCE: 0.70,
    MIN_FACE_WIDTH_RATIO: 0.15,
    MIN_KEYPOINTS_COUNT: 4,
    WASM_LOCATION: '/mediapipe',
    MODEL_PATH: '/mediapipe/blaze_face_short_range.tflite',
    MESSAGES: {
        TOO_BLURRY: 'Photo is too blurry. Please upload a crisp, well-lit photo.',
        NO_FACE: 'No clear human face detected. Ensure your face is centered and fully visible.',
        MULTIPLE_FACES: 'Multiple faces detected. Please upload a photo with only yourself.',
        TOO_FAR: 'Face is too far away. Please move closer or crop the image.',
        FACE_OBSTRUCTED: 'Face is partially covered or turned away. Please look directly at the camera.',
        GENERAL_ERROR: 'Could not verify face quality. Please upload a clearer portrait photo.',
        INVALID_FILE: 'Invalid or corrupt image file uploaded.',
    },
};

let faceDetector: any = null;

async function getFaceDetector() {
    if (!faceDetector) {
        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(FACE_VAL_CONFIG.WASM_LOCATION);

        faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: FACE_VAL_CONFIG.MODEL_PATH,
                delegate: 'GPU',
            },
            runningMode: 'IMAGE',
            minDetectionConfidence: FACE_VAL_CONFIG.MIN_DETECTION_CONFIDENCE,
        });
    }
    return faceDetector;
}

function checkBlurriness(imageElement: HTMLImageElement, threshold = FACE_VAL_CONFIG.BLUR_THRESHOLD): { isBlurry: boolean; score: number } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { isBlurry: true, score: 0 };

    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    let sum = 0;
    let sumSq = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
            const idx = (y * width + x) * 4;
            const center = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

            const left = data[idx - 4] * 0.299 + data[idx - 3] * 0.587 + data[idx - 2] * 0.114;
            const right = data[idx + 4] * 0.299 + data[idx + 5] * 0.587 + data[idx + 6] * 0.114;
            const top = data[idx - width * 4] * 0.299 + data[idx - width * 4 + 1] * 0.587 + data[idx - width * 4 + 2] * 0.114;
            const bottom = data[idx + width * 4] * 0.299 + data[idx + width * 4 + 1] * 0.587 + data[idx + width * 4 + 2] * 0.114;

            const laplacian = Math.abs(4 * center - left - right - top - bottom);
            sum += laplacian;
            sumSq += laplacian * laplacian;
            count++;
        }
    }

    const mean = sum / count;
    const variance = sumSq / count - mean * mean;

    return {
        isBlurry: variance < threshold,
        score: variance,
    };
}

/**
 * Validate image & extract standardized normalized keypoint embeddings
 */
export async function validateFaceImage(file: File): Promise<{ 
    isValid: boolean; 
    message?: string; 
    embedding?: { x: number; y: number }[] 
}> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            try {
                // 1. Sharpness / Blurriness Check
                const blurResult = checkBlurriness(img);
                if (blurResult.isBlurry) {
                    URL.revokeObjectURL(img.src);
                    return resolve({
                        isValid: false,
                        message: FACE_VAL_CONFIG.MESSAGES.TOO_BLURRY,
                    });
                }

                // 2. MediaPipe Face Count Check
                const detector = await getFaceDetector();
                const detectionResult = detector.detect(img);
                const faces = detectionResult.detections;

                URL.revokeObjectURL(img.src);

                if (faces.length === 0) {
                    return resolve({
                        isValid: false,
                        message: FACE_VAL_CONFIG.MESSAGES.NO_FACE,
                    });
                }

                if (faces.length > 1) {
                    return resolve({
                        isValid: false,
                        message: FACE_VAL_CONFIG.MESSAGES.MULTIPLE_FACES,
                    });
                }

                // 3. Quality Checks
                const detectedFace = faces[0];
                const boundingBox = detectedFace.boundingBox;

                const imgWidth = img.naturalWidth || img.width;
                const imgHeight = img.naturalHeight || img.height;

                const faceWidthRatio = boundingBox.width / imgWidth;
                if (faceWidthRatio < FACE_VAL_CONFIG.MIN_FACE_WIDTH_RATIO) {
                    return resolve({
                        isValid: false,
                        message: FACE_VAL_CONFIG.MESSAGES.TOO_FAR,
                    });
                }

                if (!detectedFace.keypoints || detectedFace.keypoints.length < FACE_VAL_CONFIG.MIN_KEYPOINTS_COUNT) {
                    return resolve({
                        isValid: false,
                        message: FACE_VAL_CONFIG.MESSAGES.FACE_OBSTRUCTED,
                    });
                }

                // 4. Extract Keypoints (Normalized 0.0 to 1.0 Decimals)
                const keypoints = detectedFace.keypoints.map((kp: any) => ({
                    x: Number((kp.x > 1 ? kp.x / imgWidth : kp.x).toFixed(4)),
                    y: Number((kp.y > 1 ? kp.y / imgHeight : kp.y).toFixed(4)),
                }));

                return resolve({ 
                    isValid: true,
                    embedding: keypoints 
                });
            } catch (error) {
                console.error('MediaPipe validation error:', error);
                URL.revokeObjectURL(img.src);
                return resolve({
                    isValid: false,
                    message: FACE_VAL_CONFIG.MESSAGES.GENERAL_ERROR,
                });
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            resolve({ isValid: false, message: FACE_VAL_CONFIG.MESSAGES.INVALID_FILE });
        };
    });
}