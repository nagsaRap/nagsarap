import 'package:flutter/material.dart';

class AppColors {
  static const navy = Color(0xFF0A0575);
  static const navyDark = Color(0xFF05023F);
  static const blue = Color(0xFF1710A5);
  static const gold = Color(0xFFFFA000);
  static const goldSoft = Color(0xFFFFF1D5);
  static const ink = Color(0xFF15141A);
  static const muted = Color(0xFF777681);
  static const line = Color(0xFFE6E4EC);
  static const surface = Color(0xFFF6F6F9);
  static const success = Color(0xFF18B558);
  static const successSoft = Color(0xFFE7F8EE);
  static const danger = Color(0xFFE84A4A);
  static const dangerSoft = Color(0xFFFFE9E9);
  static const warning = Color(0xFFE3A000);
  static const warningSoft = Color(0xFFFFF4D8);
}

ThemeData buildAppTheme() {
  final scheme = ColorScheme.fromSeed(seedColor: AppColors.navy).copyWith(
    primary: AppColors.navy,
    secondary: AppColors.gold,
    surface: Colors.white,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.surface,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: AppColors.ink,
      elevation: 0,
      centerTitle: false,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.navy, width: 1.5),
      ),
    ),
  );
}
