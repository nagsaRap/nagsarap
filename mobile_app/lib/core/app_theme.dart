import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    final base = ThemeData(useMaterial3: true, brightness: Brightness.light);

    return base.copyWith(
      scaffoldBackgroundColor: AppColors.background,

      colorScheme: const ColorScheme.light(
        primary: AppColors.navy,
        secondary: AppColors.gold,
        surface: AppColors.surface,
        error: AppColors.error,
      ),

      textTheme: GoogleFonts.poppinsTextTheme(base.textTheme),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,

        fillColor: AppColors.surface,

        hintStyle: GoogleFonts.poppins(
          fontSize: 14,
          color: AppColors.textMuted,
        ),

        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 17,
        ),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.gold, width: 1.2),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.navy, width: 1.7),
        ),

        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.error),
        ),

        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: AppColors.error, width: 1.7),
        ),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.navy,

          foregroundColor: Colors.white,

          disabledBackgroundColor: AppColors.navy.withValues(alpha: 0.35),

          disabledForegroundColor: Colors.white70,

          minimumSize: const Size(double.infinity, 54),

          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),

          textStyle: GoogleFonts.poppins(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
