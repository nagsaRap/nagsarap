class LivenessResult {
  final bool passed;
  final String message;

  const LivenessResult({
    required this.passed,
    required this.message,
  });
}

class FaceMatchResult {
  final bool matched;
  final String message;

  const FaceMatchResult({
    required this.matched,
    required this.message,
  });
}

abstract class VerificationService {
  Future<LivenessResult> verifyLiveness({
    required String liveImagePath,
  });

  Future<FaceMatchResult> compareFaces({
    required String uploadedImagePath,
    required String liveImagePath,
  });
}

/// UI ONLY.
/// Replace this class later with your real Laravel/AI connection.
class MockVerificationService implements VerificationService {
  @override
  Future<LivenessResult> verifyLiveness({
    required String liveImagePath,
  }) async {
    await Future.delayed(const Duration(milliseconds: 1200));
    return const LivenessResult(
      passed: true,
      message: 'Liveness UI flow passed in mock mode.',
    );
  }

  @override
  Future<FaceMatchResult> compareFaces({
    required String uploadedImagePath,
    required String liveImagePath,
  }) async {
    await Future.delayed(const Duration(milliseconds: 1400));
    return const FaceMatchResult(
      matched: true,
      message: 'Face-match UI flow passed in mock mode.',
    );
  }
}

/*
BACKEND MEMBER CAN LATER IMPLEMENT:

class LaravelVerificationService implements VerificationService {
  // POST live image to /api/verification/liveness
  // POST uploaded photo + live image to /api/verification/face-match
}

Suggested response:

Liveness:
{
  "passed": true,
  "confidence": 0.97,
  "message": "Liveness verified"
}

Face match:
{
  "matched": true,
  "similarity": 0.82,
  "threshold": 0.60,
  "message": "Faces matched"
}
*/
