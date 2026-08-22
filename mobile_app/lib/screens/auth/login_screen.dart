import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/primary_button.dart';
import 'register_screen.dart';
import '../home/main_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final studentId = TextEditingController(text: '23-140023');
  final password = TextEditingController();
  bool remember = false;
  bool obscure = true;
  bool loading = false;

  Future<void> _login() async {
    setState(() => loading = true);
    await Future.delayed(const Duration(milliseconds: 850));
    if (!mounted) return;
    setState(() => loading = false);
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const MainShell()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              flex: 4,
              child: Container(
                width: double.infinity,
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 14),
                child: const Center(child: AppLogo(size: 95)),
              ),
            ),
            Expanded(
              flex: 7,
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                ),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: AppColors.line),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: FilledButton(
                              onPressed: () {},
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.navy,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                              ),
                              child: const Text('Log in'),
                            ),
                          ),
                          Expanded(
                            child: TextButton(
                              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                              child: const Text('Register', style: TextStyle(color: AppColors.ink)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text('Student ID', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: studentId,
                      decoration: const InputDecoration(prefixIcon: Icon(Icons.badge_outlined), hintText: '23-140023'),
                    ),
                    const SizedBox(height: 14),
                    const Text('Password', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: password,
                      obscureText: obscure,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.lock_outline),
                        hintText: 'Enter your password',
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => obscure = !obscure),
                          icon: Icon(obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Checkbox(value: remember, onChanged: (v) => setState(() => remember = v ?? false)),
                        const Text('Remember me', style: TextStyle(fontSize: 11)),
                        const Spacer(),
                        TextButton(
                          onPressed: () => showDialog(
                            context: context,
                            builder: (_) => AlertDialog(
                              title: const Text('Coming later'),
                              content: const Text('Password recovery will be connected to the backend later.'),
                              actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
                            ),
                          ),
                          child: const Text('Forgot password?', style: TextStyle(fontSize: 11)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    PrimaryButton(label: 'Log in', loading: loading, onPressed: _login),
                    const SizedBox(height: 16),
                    const Text(
                      'Prototype UI — university authentication will be connected later.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.muted, fontSize: 10),
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
