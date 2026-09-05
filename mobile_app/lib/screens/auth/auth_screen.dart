import 'package:flutter/material.dart';

import '../../core/app_colors.dart';
import 'login_tab.dart';
import 'register_tab.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool isLogin = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        child: Column(
          children: [
            /*
             * BRAND HEADER
             */
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(
                  bottom: BorderSide(color: AppColors.gold, width: 1.5),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 142,
                    height: 142,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFFD9D9D9),
                    ),
                    child: const Icon(
                      Icons.school_rounded,
                      size: 60,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 12),

                  const Text(
                    'BRANDING',
                    style: TextStyle(
                      fontSize: 27,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),

                  const Text(
                    'Student Attendance System',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
            ),

            /*
             * LOGIN / REGISTER SELECTOR
             */
            Padding(
              padding: const EdgeInsets.fromLTRB(32, 28, 32, 26),
              child: Container(
                height: 58,
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: AppColors.gold, width: 1.5),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _AuthModeButton(
                        title: 'Log in',
                        selected: isLogin,
                        onTap: () {
                          setState(() {
                            isLogin = true;
                          });
                        },
                      ),
                    ),

                    Expanded(
                      child: _AuthModeButton(
                        title: 'Register',
                        selected: !isLogin,
                        onTap: () {
                          setState(() {
                            isLogin = false;
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),

            /*
             * FORM AREA
             */
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(46),
                    topRight: Radius.circular(46),
                  ),
                ),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: isLogin
                      ? const LoginTab(key: ValueKey('login'))
                      : const RegisterTab(key: ValueKey('register')),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthModeButton extends StatelessWidget {
  final String title;
  final bool selected;
  final VoidCallback onTap;

  const _AuthModeButton({
    required this.title,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.navy : Colors.transparent,
      borderRadius: BorderRadius.circular(28),
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: onTap,
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
