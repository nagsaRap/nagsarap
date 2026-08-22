import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../core/app_theme.dart';
import '../../widgets/primary_button.dart';

class CameraScanScreen extends StatefulWidget {
  const CameraScanScreen({super.key});

  @override
  State<CameraScanScreen> createState() => _CameraScanScreenState();
}

class _CameraScanScreenState extends State<CameraScanScreen> {
  CameraController? controller;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    Future.microtask(_setupCamera);
  }

  Future<void> _setupCamera() async {
    setState(() {
      loading = true;
      error = null;
    });

    final status = await Permission.camera.request();
    if (!status.isGranted) {
      if (!mounted) return;
      setState(() {
        loading = false;
        error = 'Camera permission was not granted.';
      });
      return;
    }

    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        if (!mounted) return;
        setState(() {
          loading = false;
          error = 'No camera is available on this device/emulator.';
        });
        return;
      }

      CameraDescription selected = cameras.first;
      for (final cam in cameras) {
        if (cam.lensDirection == CameraLensDirection.front) {
          selected = cam;
          break;
        }
      }

      final c = CameraController(selected, ResolutionPreset.medium, enableAudio: false);
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
        error = 'Camera could not be started.';
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
    return Scaffold(
      backgroundColor: AppColors.navyDark,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
        title: const Text('Face Capture', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(18, 14, 18, 10),
              child: Row(
                children: [
                  CircleAvatar(backgroundColor: Colors.white, child: Icon(Icons.camera_alt, color: AppColors.navy)),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Face Capture', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
                        Text('Position your face inside the frame.', style: TextStyle(color: Color(0xFFCAC7FF), fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: Container(
                    color: Colors.black,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        if (loading)
                          const Center(child: CircularProgressIndicator(color: AppColors.gold))
                        else if (error != null)
                          _CameraError(error: error!, onRetry: _setupCamera)
                        else if (controller != null && controller!.value.isInitialized)
                          FittedBox(
                            fit: BoxFit.cover,
                            child: SizedBox(
                              width: controller!.value.previewSize!.height,
                              height: controller!.value.previewSize!.width,
                              child: CameraPreview(controller!),
                            ),
                          ),
                        IgnorePointer(child: CustomPaint(painter: _FaceOverlayPainter())),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.fromLTRB(14, 12, 14, 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
              child: const Row(
                children: [
                  Icon(Icons.lightbulb, color: AppColors.gold),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tip: Face the camera directly and make sure your face is well lit.',
                      style: TextStyle(fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _setupCamera,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white54),
                        padding: const EdgeInsets.symmetric(vertical: 15),
                      ),
                      icon: const Icon(Icons.flip_camera_android),
                      label: const Text('Retry'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: PrimaryButton(
                      label: 'Capture',
                      icon: Icons.camera,
                      onPressed: (controller?.value.isInitialized ?? false)
                          ? () async {
                              try {
                                await controller!.takePicture();
                                if (!mounted) return;
                                _showResult(context);
                              } catch (_) {}
                            }
                          : null,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showResult(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
        title: const Icon(Icons.check_circle, color: AppColors.success, size: 58),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Camera capture successful', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
            SizedBox(height: 8),
            Text(
              'The real camera is working. Face recognition, liveness detection, and attendance submission are intentionally not connected yet.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted, fontSize: 11),
            ),
          ],
        ),
        actions: [
          PrimaryButton(
            label: 'Back to Home',
            onPressed: () {
              Navigator.pop(context);
              Navigator.popUntil(context, (route) => route.isFirst);
            },
          ),
        ],
      ),
    );
  }
}

class _CameraError extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;
  const _CameraError({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cancel, color: AppColors.danger, size: 58),
          const SizedBox(height: 14),
          Text(error, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          const Text(
            'Allow camera access in Android settings, then try again.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted, fontSize: 11),
          ),
          const SizedBox(height: 18),
          PrimaryButton(label: 'Try Again', onPressed: onRetry),
        ],
      ),
    );
  }
}

class _FaceOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final dim = Paint()..color = Colors.black.withOpacity(.25);
    final oval = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: size.width * .58,
      height: size.height * .67,
    );

    final path = Path()
      ..addRect(Offset.zero & size)
      ..addOval(oval)
      ..fillType = PathFillType.evenOdd;
    canvas.drawPath(path, dim);

    final gold = Paint()
      ..color = AppColors.gold
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.2;
    canvas.drawOval(oval, gold);

    final corner = Paint()
      ..color = Colors.white
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.square;
    const l = 24.0;
    const m = 12.0;

    canvas.drawLine(const Offset(m, m), const Offset(m + l, m), corner);
    canvas.drawLine(const Offset(m, m), const Offset(m, m + l), corner);

    canvas.drawLine(Offset(size.width - m, m), Offset(size.width - m - l, m), corner);
    canvas.drawLine(Offset(size.width - m, m), Offset(size.width - m, m + l), corner);

    canvas.drawLine(Offset(m, size.height - m), Offset(m + l, size.height - m), corner);
    canvas.drawLine(Offset(m, size.height - m), Offset(m, size.height - m - l), corner);

    canvas.drawLine(Offset(size.width - m, size.height - m), Offset(size.width - m - l, size.height - m), corner);
    canvas.drawLine(Offset(size.width - m, size.height - m), Offset(size.width - m, size.height - m - l), corner);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
