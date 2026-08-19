import 'package:flutter/material.dart';
import 'screens/auth/login_screen.dart';
import 'theme/app_colors.dart';

void main() {
  runApp(const AttendanceApp());
}

class AttendanceApp extends StatelessWidget {
  const AttendanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'CCIS Attendance',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.navy),
        fontFamily: 'Arial',
      ),
      home: const LoginScreen(),
    );
  }
}
