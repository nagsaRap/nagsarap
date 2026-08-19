import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});
  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  bool showResult = false;
  bool success = true;

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.camera_alt_outlined, color: AppColors.navy, size: 46),
            const SizedBox(height: 10),
            const Text('“CCIS Attendance” would like to access\nyour camera.',
                textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            const Text('Enable Camera to continue recording\nyour attendance.',
                textAlign: TextAlign.center, style: TextStyle(fontSize: 10, color: AppColors.muted)),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(child: TextButton(onPressed: () => Navigator.pop(context), child: const Text("Don't allow"))),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.navy, foregroundColor: Colors.white),
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Allow'),
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  void _result(bool ok) {
    setState(() {
      success = ok;
      showResult = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(backgroundColor: AppColors.navy, foregroundColor: Colors.white, elevation: 0),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.all(14),
            children: [
              const Row(
                children: [
                  CircleAvatar(radius: 18, backgroundColor: Colors.white, child: Icon(Icons.camera_alt, color: AppColors.navy)),
                  SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Face Capture', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                      Text('Please position your face in the frame.',
                          style: TextStyle(color: Colors.white70, fontSize: 9)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                height: 410,
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 220,
                      height: 330,
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.yellow),
                        borderRadius: BorderRadius.circular(120),
                      ),
                    ),
                    const Positioned(top: 18, left: 18, child: Icon(Icons.crop_free, color: Colors.black54)),
                    const Positioned(bottom: 18, right: 18, child: Icon(Icons.crop_free, color: Colors.black54)),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(7)),
                child: const Text('💡 Tips: Make sure your face is visible and well lit before scanning',
                    style: TextStyle(fontSize: 9, color: Colors.black54)),
              ),
              const SizedBox(height: 15),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    onPressed: _showPermissionDialog,
                    icon: const Icon(Icons.face_retouching_natural, color: Colors.white),
                  ),
                  const SizedBox(width: 34),
                  InkWell(
                    onTap: () => _result(true),
                    onLongPress: () => _result(false),
                    child: const CircleAvatar(
                      radius: 27,
                      backgroundColor: Colors.white,
                      child: CircleAvatar(radius: 21, backgroundColor: AppColors.navy, child: Icon(Icons.camera_alt, color: Colors.white)),
                    ),
                  )
                ],
              )
            ],
          ),
          if (showResult)
            Container(
              color: Colors.black54,
              alignment: Alignment.center,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 24),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: success ? AppColors.success : AppColors.danger,
                      child: Icon(success ? Icons.check : Icons.close, color: Colors.white, size: 36),
                    ),
                    const SizedBox(height: 15),
                    Text(
                      success ? 'Attendance Record\nsuccessfully' : 'Unable to verify your face',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      success ? 'Your attendance has been recorded.' : 'Please make sure your face is visible\nand well lit.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.muted, fontSize: 10),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.navy, foregroundColor: Colors.white),
                      onPressed: () {
                        if (success) {
                          Navigator.pop(context);
                        } else {
                          setState(() => showResult = false);
                        }
                      },
                      child: Text(success ? 'Back to Home' : 'Try Again'),
                    )
                  ],
                ),
              ),
            )
        ],
      ),
    );
  }
}
