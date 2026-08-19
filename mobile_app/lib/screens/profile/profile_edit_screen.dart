import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_field.dart';

class ProfileEditScreen extends StatelessWidget {
  const ProfileEditScreen({super.key});

  void _saved(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(radius: 24, backgroundColor: AppColors.success, child: Icon(Icons.check, color: Colors.white, size: 30)),
            const SizedBox(height: 14),
            const Text('Profile updated', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            const Text('Your changes have been saved\nsuccessfully.',
                textAlign: TextAlign.center, style: TextStyle(fontSize: 10, color: AppColors.muted)),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.navy, foregroundColor: Colors.white),
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('Continue'),
              ),
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(backgroundColor: AppColors.navy, foregroundColor: Colors.white, elevation: 0),
      body: Column(
        children: [
          const CircleAvatar(radius: 30, backgroundColor: AppColors.yellow, child: Icon(Icons.person_outline, size: 36, color: AppColors.navy)),
          const SizedBox(height: 8),
          const Text('Reina Jean Rafanan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
          const Text('BS Computer Science', style: TextStyle(color: AppColors.yellow, fontWeight: FontWeight.w700, fontSize: 12)),
          const SizedBox(height: 24),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
              child: ListView(
                children: [
                  const Row(
                    children: [
                      Expanded(child: AppField(label: 'First Name', hint: 'Reina Jean')),
                      SizedBox(width: 8),
                      Expanded(child: AppField(label: 'Last Name', hint: 'Rafanan')),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const AppField(label: 'Student Number', hint: '23-140023', enabled: false),
                  const Text("Student number can't be changed", style: TextStyle(fontSize: 8, color: AppColors.muted)),
                  const SizedBox(height: 12),
                  const AppField(label: 'Email Address', hint: 'rafananreinajean@email.com'),
                  const SizedBox(height: 12),
                  const AppField(label: 'Program/Section', hint: 'BSCS 4-A'),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.navy)),
                          child: const Text('Cancel', style: TextStyle(color: AppColors.navy)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.navy, foregroundColor: Colors.white),
                          onPressed: () => _saved(context),
                          child: const Text('Save Changes'),
                        ),
                      ),
                    ],
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
