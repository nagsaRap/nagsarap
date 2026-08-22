import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

class LivenessCaptureResult {
  final String liveImagePath;
  const LivenessCaptureResult(this.liveImagePath);
}

class LivenessScreen extends StatefulWidget {
  const LivenessScreen({super.key});

  @override
  State<LivenessScreen> createState() => _LivenessScreenState();
}

class _LivenessScreenState extends State<LivenessScreen> {
  static const navy = Color(0xFF08086B);
  static const gold = Color(0xFFFFA000);

  CameraController? controller;
  bool loading = true;
  bool capturing = false;
  String? error;
  int step = 0;

  final challenges = const [
    ('Center your face', 'Keep your whole face inside the oval.'),
    ('Turn slightly left', 'Move naturally while staying inside the frame.'),
    ('Turn slightly right', 'Keep looking toward the phone.'),
    ('Hold still', 'Your live verification photo is ready to capture.'),
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(initCamera);
  }

  Future<void> initCamera() async {
    setState(() {
      loading = true;
      error = null;
    });

    final permission = await Permission.camera.request();
    if (!permission.isGranted) {
      if (!mounted) return;
      setState(() {
        loading = false;
        error = 'Camera permission is required.';
      });
      return;
    }

    try {
      final cams = await availableCameras();
      if (cams.isEmpty) throw Exception();

      var selected = cams.first;
      for (final c in cams) {
        if (c.lensDirection == CameraLensDirection.front) {
          selected = c;
          break;
        }
      }

      final c = CameraController(
        selected,
        ResolutionPreset.medium,
        enableAudio: false,
      );
      await c.initialize();

      if (!mounted) {
        await c.dispose();
        return;
      }

      setState(() {
        controller = c;
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        loading = false;
        error = 'Could not start the front camera.';
      });
    }
  }

  Future<void> next() async {
    if (controller == null || !controller!.value.isInitialized) return;

    if (step < challenges.length - 1) {
      setState(() => step++);
      return;
    }

    setState(() => capturing = true);
    try {
      final photo = await controller!.takePicture();
      if (!mounted) return;
      Navigator.pop(context, LivenessCaptureResult(photo.path));
    } catch (_) {
      if (!mounted) return;
      setState(() {
        capturing = false;
        error = 'Could not capture the live photo.';
      });
    }
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final current = challenges[step];

    return Scaffold(
      backgroundColor: const Color(0xFF050547),
      appBar: AppBar(
        backgroundColor: const Color(0xFF050547),
        foregroundColor: Colors.white,
        title: const Text(
          'Liveness Check',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 6, 14, 10),
              child: Row(
                children: List.generate(
                  challenges.length,
                  (i) => Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: i <= step ? gold : Colors.white24,
                        borderRadius: BorderRadius.circular(99),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    color: Colors.black,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        if (loading)
                          const Center(
                            child: CircularProgressIndicator(color: gold),
                          )
                        else if (error != null)
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.videocam_off,
                                    color: Colors.red,
                                    size: 52,
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    error!,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                  const SizedBox(height: 12),
                                  FilledButton(
                                    onPressed: initCamera,
                                    child: const Text('Try Again'),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else if (controller != null)
                          FittedBox(
                            fit: BoxFit.cover,
                            child: SizedBox(
                              width: controller!.value.previewSize!.height,
                              height: controller!.value.previewSize!.width,
                              child: CameraPreview(controller!),
                            ),
                          ),
                        const IgnorePointer(
                          child: CustomPaint(painter: FaceGuidePainter()),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.fromLTRB(14, 12, 14, 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(17),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Color(0xFFFFE8A3),
                    child: Icon(
                      Icons.face_retouching_natural,
                      color: navy,
                    ),
                  ),
                  const SizedBox(width: 9),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          current.$1,
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                        Text(
                          current.$2,
                          style: const TextStyle(
                            color: Colors.black54,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 8),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton.icon(
                  onPressed: loading || error != null || capturing ? null : next,
                  style: FilledButton.styleFrom(
                    backgroundColor: gold,
                    foregroundColor: navy,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                  icon: capturing
                      ? const SizedBox(
                          width: 17,
                          height: 17,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: navy,
                          ),
                        )
                      : Icon(
                          step == challenges.length - 1
                              ? Icons.camera_alt
                              : Icons.arrow_forward,
                        ),
                  label: Text(
                    capturing
                        ? 'Capturing...'
                        : step == challenges.length - 1
                            ? 'Capture Live Photo'
                            : 'Continue',
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(18, 0, 18, 12),
              child: Text(
                'The motion prompts are UI guidance only for now. '
                'Real anti-spoofing/liveness validation will be supplied by your verification service.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, fontSize: 9.5),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class FaceGuidePainter extends CustomPainter {
  const FaceGuidePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final oval = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: size.width * .62,
      height: size.height * .70,
    );

    final shade = Path()
      ..addRect(Offset.zero & size)
      ..addOval(oval)
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(
      shade,
      Paint()..color = Colors.black.withOpacity(.35),
    );

    canvas.drawOval(
      oval,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5
        ..color = const Color(0xFFFFA000),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
