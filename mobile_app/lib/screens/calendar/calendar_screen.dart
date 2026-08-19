import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class CalendarScreen extends StatelessWidget {
  const CalendarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const Text('Calendar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
          child: CalendarDatePicker(
            initialDate: DateTime.now(),
            firstDate: DateTime(2025),
            lastDate: DateTime(2028),
            onDateChanged: (_) {},
          ),
        ),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Upcoming event', style: TextStyle(color: AppColors.muted, fontSize: 10)),
              SizedBox(height: 6),
              Text('CCIS Athlete Selection', style: TextStyle(fontWeight: FontWeight.w700)),
              Text('Aug 17, 2026 • 8:00 AM • Covered Court', style: TextStyle(fontSize: 10, color: AppColors.muted)),
            ],
          ),
        ),
      ],
    );
  }
}
