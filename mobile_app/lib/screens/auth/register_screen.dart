import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_field.dart';
import '../../widgets/brand_logo.dart';
import '../../widgets/primary_button.dart';
import 'login_screen.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  void _success(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.success,
              child: Icon(Icons.check, color: Colors.white, size: 32),
            ),
            const SizedBox(height: 16),
            const Text('Registration successful', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            const Text('Your account has been created.\nYou can now log in.',
                textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted, fontSize: 11)),
            const SizedBox(height: 16),
            PrimaryButton(
              text: 'Go to Log in',
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              color: Colors.white,
              padding: const EdgeInsets.only(top: 18, bottom: 10),
              child: const Column(
                children: [
                  BrandLogo(size: 72),
                  SizedBox(height: 6),
                  Text('CCIS', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800)),
                  Text('Student Attendance System', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30)),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 11),
                        child: Center(child: Text('Log in', style: TextStyle(fontSize: 12))),
                      ),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.all(4),
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      decoration: BoxDecoration(color: AppColors.navy, borderRadius: BorderRadius.circular(24)),
                      child: const Center(child: Text('Register', style: TextStyle(color: Colors.white, fontSize: 12))),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: ListView(
                  children: [
                    const Row(
                      children: [
                        Expanded(child: AppField(label: 'First Name', hint: 'First Name')),
                        SizedBox(width: 8),
                        Expanded(child: AppField(label: 'Last Name', hint: 'Last Name')),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const AppField(label: 'Student Number', hint: '00-000000'),
                    const SizedBox(height: 10),
                    const AppField(label: 'Email Address', hint: 'example@email.com'),
                    const SizedBox(height: 10),
                    const AppField(label: 'Set Password', hint: 'Password', obscureText: true),
                    const SizedBox(height: 10),
                    const AppField(label: 'Confirm Password', hint: 'Confirm Password', obscureText: true),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(62),
                        side: const BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.upload_file, color: Colors.black),
                      label: const Text('Upload your Form 5 here\nBrowse',
                          textAlign: TextAlign.center, style: TextStyle(color: Colors.black54, fontSize: 10)),
                    ),
                    const SizedBox(height: 12),
                    PrimaryButton(text: 'Register', onPressed: () => _success(context)),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
