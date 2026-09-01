import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
import insightface
from insightface.app import FaceAnalysis

app = Flask(__name__)

# Initialize InsightFace with buffalo_l model
face_analyzer = FaceAnalysis(name='buffalo_l')
face_analyzer.prepare(ctx_id=-1, det_size=(640, 640))

def base64_to_cv2(b64_str: str):
    """Converts a Base64 image string into an OpenCV BGR image matrix."""
    if ',' in b64_str:
        b64_str = b64_str.split(',')[1]
    img_bytes = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@app.route('/extract-embedding', methods=['POST'])
def extract_embedding():
    data = request.get_json()

    if not data or 'image_base64' not in data:
        return jsonify({'detail': 'Missing image_base64 in request body.'}), 400

    try:
        # 1. Decode Base64 string to OpenCV Image
        img = base64_to_cv2(data['image_base64'])
        if img is None:
            return jsonify({'detail': 'Invalid image format uploaded.'}), 400

        # 2. Extract Facial Embeddings
        faces = face_analyzer.get(img)

        # 3. Enforce Single Face & Quality Rules
        if len(faces) == 0:
            return jsonify({'detail': 'No face detected in image. Ensure proper lighting and visibility.'}), 400

        if len(faces) > 1:
            return jsonify({'detail': 'Multiple faces detected. Only one face is allowed per frame.'}), 400

        primary_face = faces[0]

        # Check Detection Confidence Score
        if hasattr(primary_face, 'det_score') and primary_face.det_score < 0.65:
            return jsonify({'detail': 'Face visibility too low. Ensure face is clear of obstacles.'}), 400

        # 4. Extract & L2-Normalize 512-D Vector
        raw_embedding = primary_face.embedding
        norm = np.linalg.norm(raw_embedding)
        
        if norm == 0:
            return jsonify({'detail': 'Invalid facial feature vector generated.'}), 400
            
        normalized_embedding = (raw_embedding / norm).tolist()

        return jsonify({
            'status': 'success',
            'embedding': normalized_embedding
        }), 200

    except Exception as e:
        return jsonify({'detail': f'Biometric processing error: {str(e)}'}), 500

if __name__ == '__main__':
    # Runs microservice on http://127.0.0.1:5000
    app.run(host='127.0.0.1', port=5000, debug=True)