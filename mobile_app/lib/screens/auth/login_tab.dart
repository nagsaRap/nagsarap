import 'package:flutter/material.dart';

import '../../core/app_colors.dart';
import '../../widgets/app_text_field.dart';

class LoginTab extends StatefulWidget {
  const LoginTab({super.key});

  @override
  State<LoginTab> createState() => _LoginTabState();
}

class _LoginTabState extends State<LoginTab> {
  final studentNumberController = TextEditingController();

  final passwordController = TextEditingController();

  bool rememberMe = false;
  bool hidePassword = true;

  @override
  void dispose() {
    studentNumberController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(30, 34, 30, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppTextField(
            label: 'Student ID',
            hint: '23-140012',
            controller: studentNumberController,
            keyboardType: TextInputType.number,
          ),

          const SizedBox(height: 28),

          AppTextField(
            label: 'Password',
            hint: 'Enter your password',
            controller: passwordController,
            obscureText: hidePassword,
            prefixIcon: const Icon(Icons.lock_outline, size: 20),
            suffixIcon: IconButton(
              onPressed: () {
                setState(() {
                  hidePassword = !hidePassword;
                });
              },
              icon: Icon(
                hidePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
              ),
            ),
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Checkbox(
                value: rememberMe,
                activeColor: AppColors.navy,
                onChanged: (value) {
                  setState(() {
                    rememberMe = value ?? false;
                  });
                },
              ),

              const Expanded(
                child: Text(
                  'Remember me',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),

              TextButton(
                onPressed: () {},
                child: const Text(
                  'Forgot password?',
                  style: TextStyle(fontSize: 13, color: AppColors.textPrimary),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () {
                // API login comes next.
              },
              child: const Text('Log in'),
            ),
          ),
        ],
      ),
    );
  }
}
