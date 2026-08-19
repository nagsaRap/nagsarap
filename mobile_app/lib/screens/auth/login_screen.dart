import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_field.dart';
import '../../widgets/brand_logo.dart';
import '../../widgets/primary_button.dart';
import '../main_shell.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool remember = false;

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
              padding: const EdgeInsets.only(top: 22, bottom: 14),
              child: const Column(
                children: [
                  BrandLogo(),
                  SizedBox(height: 8),
                  Text('CCIS', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                  Text('Student Attendance System', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30)),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.all(4),
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      decoration: BoxDecoration(color: AppColors.navy, borderRadius: BorderRadius.circular(24)),
                      child: const Center(child: Text('Log in', style: TextStyle(color: Colors.white, fontSize: 12))),
                    ),
                  ),
                  Expanded(
                    child: InkWell(
                      onTap: () => Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const RegisterScreen()),
                      ),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 11),
                        child: Center(child: Text('Register', style: TextStyle(fontSize: 12))),
                      ),
                    ),
                  )
                ],
              ),
            ),
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(18, 20, 18, 20),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: ListView(
                  children: [
                    const AppField(label: 'Student ID', hint: '23-140023'),
                    const SizedBox(height: 14),
                    const AppField(label: 'Password', hint: 'Enter your Password', obscureText: true),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        Checkbox(
                          value: remember,
                          visualDensity: VisualDensity.compact,
                          onChanged: (v) => setState(() => remember = v ?? false),
                        ),
                        const Text('Remember me', style: TextStyle(fontSize: 10)),
                        const Spacer(),
                        TextButton(
                          onPressed: () {},
                          child: const Text('Forgot password?', style: TextStyle(color: Colors.black, fontSize: 10)),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),
                    PrimaryButton(
                      text: 'Log in',
                      onPressed: () => Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const MainShell()),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
