import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from insightface.app import FaceAnalysis

app = Flask(__name__)

face_analyzer = FaceAnalysis(name='buffalo_l')
face_analyzer.prepare(ctx_id=-1, det_size=(640, 640))


def base64_to_cv2(b64_str: str):
    if ',' in b64_str:
        b64_str = b64_str.split(',', 1)[1]
    img_bytes = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


@app.get('/health')
def health():
    return jsonify({
        'success': True,
        'service': 'CCIS Face Verification',
        'insightface': 'ready',
        'opencv': 'ready',
    })


@app.post('/extract-embedding')
def extract_embedding():
    data = request.get_json(silent=True)

    if not data or 'image_base64' not in data:
        return jsonify({'detail': 'Missing image_base64 in request body.'}), 400

    try:
        img = base64_to_cv2(data['image_base64'])
        if img is None:
            return jsonify({'detail': 'Invalid image format uploaded.'}), 400

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        if blur_score < 35:
            return jsonify({'detail': 'Image is too blurry. Hold the camera steady and try again.'}), 400

        faces = face_analyzer.get(img)

        if len(faces) == 0:
            return jsonify({'detail': 'No face detected in image. Ensure proper lighting and visibility.'}), 400

        if len(faces) > 1:
            return jsonify({'detail': 'Multiple faces detected. Only one face is allowed per frame.'}), 400

        primary_face = faces[0]

        if hasattr(primary_face, 'det_score') and primary_face.det_score < 0.65:
            return jsonify({'detail': 'Face visibility too low. Ensure face is clear of obstacles.'}), 400

        raw_embedding = primary_face.embedding
        norm = np.linalg.norm(raw_embedding)

        if norm == 0:
            return jsonify({'detail': 'Invalid facial feature vector generated.'}), 400

        normalized_embedding = (raw_embedding / norm).tolist()

        return jsonify({
            'status': 'success',
            'embedding': normalized_embedding,
            'quality': {
                'blur_score': round(float(blur_score), 2),
                'detection_score': round(float(primary_face.det_score), 4),
            }
        }), 200

    except Exception as exc:
        return jsonify({'detail': f'Biometric processing error: {str(exc)}'}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
