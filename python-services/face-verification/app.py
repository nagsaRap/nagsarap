import base64
import binascii

import cv2
import numpy as np
from flask import Flask, jsonify, request
from insightface.app import FaceAnalysis


# ============================================================
# APP CONFIGURATION
# ============================================================

app = Flask(__name__)

# Minimum acceptable face sharpness.
#
# Webcam frames are naturally softer than uploaded photos,
# so this should not be excessively high.
MIN_BLUR_SCORE = 30.0

# Minimum InsightFace face detection confidence.
MIN_DETECTION_SCORE = 0.60

# Limit incoming JSON payload.
# Base64 images are larger than the original JPEG.
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024


# ============================================================
# INSIGHTFACE INITIALIZATION
# ============================================================

print("Loading InsightFace model...")

face_analyzer = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"],
)

face_analyzer.prepare(
    ctx_id=-1,
    det_size=(640, 640),
)

print("InsightFace model loaded successfully.")


# ============================================================
# IMAGE HELPERS
# ============================================================

def base64_to_cv2(b64_str: str):
    """
    Convert a base64/data-URL image into an OpenCV BGR image.
    """

    if not isinstance(b64_str, str) or not b64_str.strip():
        raise ValueError("Image data is empty.")

    # Handle:
    # data:image/jpeg;base64,/9j/4AAQ...
    if "," in b64_str:
        b64_str = b64_str.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(
            b64_str,
            validate=True,
        )
    except (ValueError, binascii.Error) as exc:
        raise ValueError(
            "Invalid base64 image data."
        ) from exc

    if not img_bytes:
        raise ValueError("Decoded image is empty.")

    nparr = np.frombuffer(
        img_bytes,
        dtype=np.uint8,
    )

    image = cv2.imdecode(
        nparr,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise ValueError(
            "Unable to decode the supplied image."
        )

    return image


def calculate_face_blur(image, face) -> float:
    """
    Calculate sharpness using only the detected face.

    Higher score = sharper image.
    Lower score = blurrier image.
    """

    bbox = face.bbox.astype(int)

    x1, y1, x2, y2 = bbox

    height, width = image.shape[:2]

    # Add a small margin around the face.
    face_width = x2 - x1
    face_height = y2 - y1

    margin_x = int(face_width * 0.08)
    margin_y = int(face_height * 0.08)

    x1 = max(0, x1 - margin_x)
    y1 = max(0, y1 - margin_y)

    x2 = min(width, x2 + margin_x)
    y2 = min(height, y2 + margin_y)

    face_crop = image[
        y1:y2,
        x1:x2
    ]

    if face_crop.size == 0:
        return 0.0

    gray = cv2.cvtColor(
        face_crop,
        cv2.COLOR_BGR2GRAY,
    )

    # Slightly normalize the image so normal webcam
    # lighting does not unfairly lower the score.
    gray = cv2.equalizeHist(gray)

    blur_score = cv2.Laplacian(
        gray,
        cv2.CV_64F,
    ).var()

    return float(blur_score)


def normalize_embedding(embedding):
    """
    Normalize InsightFace embedding to unit length.
    """

    embedding = np.asarray(
        embedding,
        dtype=np.float32,
    )

    norm = np.linalg.norm(embedding)

    if norm <= 0:
        raise ValueError(
            "Invalid facial feature vector generated."
        )

    return (
        embedding / norm
    ).tolist()


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return jsonify({
        "success": True,
        "service": "CCIS Face Verification",
        "insightface": "ready",
        "opencv": "ready",
        "blur_threshold": MIN_BLUR_SCORE,
        "detection_threshold": MIN_DETECTION_SCORE,
    }), 200


# ============================================================
# EXTRACT FACE EMBEDDING
# ============================================================

@app.post("/extract-embedding")
def extract_embedding():

    # --------------------------------------------------------
    # 1. Validate request
    # --------------------------------------------------------

    data = request.get_json(
        silent=True
    )

    if not data:
        return jsonify({
            "success": False,
            "detail": "Invalid or missing JSON request body.",
        }), 400

    image_base64 = data.get(
        "image_base64"
    )

    if not image_base64:
        return jsonify({
            "success": False,
            "detail": "Missing image_base64 in request body.",
        }), 400

    try:

        # ----------------------------------------------------
        # 2. Decode image
        # ----------------------------------------------------

        image = base64_to_cv2(
            image_base64
        )

        height, width = image.shape[:2]

        print(
            f"[FACE] Received image: "
            f"{width}x{height}"
        )

        # ----------------------------------------------------
        # 3. Detect face FIRST
        # ----------------------------------------------------

        faces = face_analyzer.get(
            image
        )

        print(
            f"[FACE] Faces detected: "
            f"{len(faces)}"
        )

        if len(faces) == 0:
            return jsonify({
                "success": False,
                "detail":
                    "No face detected in image. "
                    "Ensure your face is visible and the area is well lit.",
            }), 400

        if len(faces) > 1:
            return jsonify({
                "success": False,
                "detail":
                    "Multiple faces detected. "
                    "Only one face is allowed per frame.",
            }), 400

        primary_face = faces[0]

        # ----------------------------------------------------
        # 4. Detection confidence
        # ----------------------------------------------------

        detection_score = float(
            getattr(
                primary_face,
                "det_score",
                0.0,
            )
        )

        print(
            f"[FACE] Detection score: "
            f"{detection_score:.4f}"
        )

        if (
            detection_score
            < MIN_DETECTION_SCORE
        ):
            return jsonify({
                "success": False,
                "detail":
                    "Face visibility is too low. "
                    "Face the camera directly and improve the lighting.",
                "quality": {
                    "detection_score":
                        round(
                            detection_score,
                            4,
                        ),
                    "required_detection_score":
                        MIN_DETECTION_SCORE,
                },
            }), 400

        # ----------------------------------------------------
        # 5. Blur detection
        #
        # IMPORTANT:
        # Check ONLY the detected face instead of the
        # entire webcam image.
        # ----------------------------------------------------

        blur_score = calculate_face_blur(
            image,
            primary_face,
        )

        print(
            f"[FACE] Face blur score: "
            f"{blur_score:.2f} "
            f"(minimum {MIN_BLUR_SCORE})"
        )

        if blur_score < MIN_BLUR_SCORE:
            return jsonify({
                "success": False,
                "detail":
                    "Image is too blurry. "
                    "Hold the camera steady and try again.",
                "quality": {
                    "blur_score":
                        round(
                            blur_score,
                            2,
                        ),
                    "required_blur_score":
                        MIN_BLUR_SCORE,
                    "detection_score":
                        round(
                            detection_score,
                            4,
                        ),
                },
            }), 400

        # ----------------------------------------------------
        # 6. Extract embedding
        # ----------------------------------------------------

        raw_embedding = getattr(
            primary_face,
            "embedding",
            None,
        )

        if raw_embedding is None:
            return jsonify({
                "success": False,
                "detail":
                    "InsightFace could not generate "
                    "a facial embedding.",
            }), 400

        normalized_embedding = (
            normalize_embedding(
                raw_embedding
            )
        )

        # ----------------------------------------------------
        # 7. Face bounding box
        # ----------------------------------------------------

        bbox = (
            primary_face
            .bbox
            .astype(int)
            .tolist()
        )

        # ----------------------------------------------------
        # 8. Success
        # ----------------------------------------------------

        print(
            "[FACE] Embedding extracted successfully."
        )

        return jsonify({
            "success": True,
            "status": "success",

            "embedding":
                normalized_embedding,

            "quality": {
                "blur_score":
                    round(
                        blur_score,
                        2,
                    ),

                "required_blur_score":
                    MIN_BLUR_SCORE,

                "detection_score":
                    round(
                        detection_score,
                        4,
                    ),

                "required_detection_score":
                    MIN_DETECTION_SCORE,

                "image_width":
                    width,

                "image_height":
                    height,

                "face_bbox":
                    bbox,
            },
        }), 200

    # --------------------------------------------------------
    # Known image errors
    # --------------------------------------------------------

    except ValueError as exc:

        print(
            f"[FACE] Validation error: {exc}"
        )

        return jsonify({
            "success": False,
            "detail": str(exc),
        }), 400

    # --------------------------------------------------------
    # Unexpected errors
    # --------------------------------------------------------

    except Exception as exc:

        print(
            f"[FACE] Processing error: {exc}"
        )

        return jsonify({
            "success": False,
            "detail":
                f"Biometric processing error: {str(exc)}",
        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("")
    print(
        "=========================================="
    )
    print(
        " CCIS Face Verification Service"
    )
    print(
        "=========================================="
    )
    print(
        f" Blur threshold     : {MIN_BLUR_SCORE}"
    )
    print(
        f" Detection threshold: {MIN_DETECTION_SCORE}"
    )
    print(
        " Server             : http://127.0.0.1:5000"
    )
    print(
        "=========================================="
    )
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=False,
    )