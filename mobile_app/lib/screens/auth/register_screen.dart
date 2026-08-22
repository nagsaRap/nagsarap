import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/primary_button.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  bool loading = false;

  Future<void> _register() async {
    setState(() => loading = true);
    await Future.delayed(const Duration(milliseconds: 1000));
    if (!mounted) return;
    setState(() => loading = false);
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Icon(Icons.check_circle, color: AppColors.success, size: 54),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Registration successful', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
            SizedBox(height: 8),
            Text('Your account has been created. You can now log in.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
          ],
        ),
        actions: [
          PrimaryButton(
            label: 'Go to login',
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Container(
              color: Colors.white,
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 18),
              child: const Center(child: AppLogo(size: 66)),
            ),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Row(
                      children: [
                        IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back)),
                        const Text('Create your account', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const _Field(label: 'First Name', hint: 'First name'),
                    const _Field(label: 'Last Name', hint: 'Last name'),
                    const _Field(label: 'Student Number', hint: '00-000000'),
                    const _Field(label: 'Email Address', hint: 'example@mmsu.edu.ph'),
                    const _Field(label: 'Program / Section', hint: 'BSCS 4A'),
                    const _Field(label: 'Set Password', hint: 'Password', obscure: true),
                    const _Field(label: 'Confirm Password', hint: 'Confirm password', obscure: true),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Form 5 upload UI only for now.'))),
                      icon: const Icon(Icons.upload_file),
                      label: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 15),
                        child: Text('Upload Form 5'),
                      ),
                    ),
                    const SizedBox(height: 12),
                    PrimaryButton(label: 'Register', loading: loading, onPressed: _register),
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

class _Field extends StatelessWidget {
  final String label;
  final String hint;
  final bool obscure;
  const _Field({required this.label, required this.hint, this.obscure = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
          const SizedBox(height: 5),
          TextField(obscureText: obscure, decoration: InputDecoration(hintText: hint)),
        ],
      ),
    );
  }
}
