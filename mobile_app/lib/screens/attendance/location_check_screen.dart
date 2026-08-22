import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/app_theme.dart';
import '../../widgets/primary_button.dart';
import 'camera_scan_screen.dart';

class LocationCheckScreen extends StatefulWidget {
  const LocationCheckScreen({super.key});

  @override
  State<LocationCheckScreen> createState() => _LocationCheckScreenState();
}

class _LocationCheckScreenState extends State<LocationCheckScreen> {
  Position? position;
  String status = 'Ready to check your location';
  bool loading = false;

  Future<void> _checkLocation() async {
    setState(() {
      loading = true;
      status = 'Checking device location…';
    });

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          loading = false;
          status = 'Location services are turned off.';
        });
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
        setState(() {
          loading = false;
          status = 'Location permission was not granted.';
        });
        return;
      }

      final p = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      await Future.delayed(const Duration(milliseconds: 650));

      if (!mounted) return;
      setState(() {
        position = p;
        loading = false;
        status = 'Device location acquired';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        loading = false;
        status = 'Unable to get your location.';
      });
    }
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(_checkLocation);
  }

  @override
  Widget build(BuildContext context) {
    final ok = position != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Check Location', style: TextStyle(fontWeight: FontWeight.w900)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Container(
            height: 240,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF3EE),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.line),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Positioned.fill(child: CustomPaint(painter: _MapPainter())),
                Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.navy.withOpacity(.08),
                    border: Border.all(color: AppColors.navy, width: 2),
                  ),
                ),
                const Icon(Icons.location_on, color: AppColors.gold, size: 54),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.line),
            ),
            child: Column(
              children: [
                if (loading) ...[
                  const CircularProgressIndicator(color: AppColors.navy),
                  const SizedBox(height: 14),
                ] else
                  Icon(
                    ok ? Icons.check_circle : Icons.location_searching,
                    color: ok ? AppColors.success : AppColors.navy,
                    size: 44,
                  ),
                const SizedBox(height: 8),
                Text(status, style: const TextStyle(fontWeight: FontWeight.w900)),
                if (position != null) ...[
                  const SizedBox(height: 10),
                  Text('Latitude: ${position!.latitude.toStringAsFixed(6)}', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                  Text('Longitude: ${position!.longitude.toStringAsFixed(6)}', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                  Text('Accuracy: ±${position!.accuracy.toStringAsFixed(1)} m', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                ],
                const SizedBox(height: 10),
                const Text(
                  'This screen now reads the real device coordinates. Real “inside event radius” validation is intentionally left for the next stage, when the event latitude, longitude, and radius come from your event data.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 10, color: AppColors.muted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          PrimaryButton(
            label: loading ? 'Checking…' : 'Check Again',
            icon: Icons.my_location,
            loading: loading,
            onPressed: _checkLocation,
          ),
          const SizedBox(height: 10),
          PrimaryButton(
            label: 'Continue to Camera',
            icon: Icons.camera_alt_outlined,
            onPressed: position == null
                ? null
                : () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CameraScanScreen())),
          ),
        ],
      ),
    );
  }
}

class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final road = Paint()
      ..color = Colors.white
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;
    final thin = Paint()
      ..color = const Color(0xFFD4DED8)
      ..strokeWidth = 3;

    canvas.drawLine(Offset(0, size.height * .28), Offset(size.width, size.height * .62), road);
    canvas.drawLine(Offset(size.width * .2, 0), Offset(size.width * .55, size.height), road);
    canvas.drawLine(Offset(0, size.height * .7), Offset(size.width, size.height * .35), thin);
    canvas.drawRect(Rect.fromLTWH(size.width * .08, size.height * .1, 70, 45), Paint()..color = const Color(0xFFD9DEE2));
    canvas.drawRect(Rect.fromLTWH(size.width * .68, size.height * .62, 85, 50), Paint()..color = const Color(0xFFD9DEE2));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
