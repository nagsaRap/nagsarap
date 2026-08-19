import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_field.dart';
import '../../widgets/primary_button.dart';
import 'profile_edit_screen.dart';

class PersonalInfoScreen extends StatelessWidget {
  const PersonalInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(backgroundColor: AppColors.navy, foregroundColor: Colors.white, elevation: 0),
      body: Column(
        children: [
          const SizedBox(height: 6),
          const CircleAvatar(
            radius: 30,
            backgroundColor: AppColors.yellow,
            child: Icon(Icons.person_outline, size: 36, color: AppColors.navy),
          ),
          const SizedBox(height: 8),
          const Text('Reina Jean Rafanan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
          const Text('BS Computer Science', style: TextStyle(color: AppColors.yellow, fontWeight: FontWeight.w700, fontSize: 12)),
          const SizedBox(height: 24),
          Expanded(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: ListView(
                children: [
                  const Row(
                    children: [
                      Expanded(child: AppField(label: 'First Name', hint: 'Reina Jean', enabled: false)),
                      SizedBox(width: 8),
                      Expanded(child: AppField(label: 'Last Name', hint: 'Rafanan', enabled: false)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const AppField(label: 'Student Number', hint: '23-140023', enabled: false),
                  const SizedBox(height: 12),
                  const AppField(label: 'Email Address', hint: 'rafananreinajean@email.com', enabled: false),
                  const SizedBox(height: 12),
                  const AppField(label: 'Program/Section', hint: 'BSCS 4-A', enabled: false),
                  const SizedBox(height: 20),
                  PrimaryButton(
                    text: 'Edit Profile',
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileEditScreen())),
                  ),
                  const SizedBox(height: 10),
                  PrimaryButton(text: 'Back to Home', outlined: true, onPressed: () => Navigator.pop(context)),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
