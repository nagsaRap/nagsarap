import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class StatusChip extends StatelessWidget {
  final String label;
  const StatusChip(this.label, {super.key});

  @override
  Widget build(BuildContext context) {
    Color bg = AppColors.successSoft;
    Color fg = AppColors.success;
    final lower = label.toLowerCase();
    if (lower.contains('absent') || lower.contains('failed')) {
      bg = AppColors.dangerSoft;
      fg = AppColors.danger;
    } else if (lower.contains('ongoing') || lower.contains('upcoming')) {
      bg = AppColors.warningSoft;
      fg = AppColors.warning;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: fg)),
    );
  }
}
