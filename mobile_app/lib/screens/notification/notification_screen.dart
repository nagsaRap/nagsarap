import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});
  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  bool log = false;

  @override
  Widget build(BuildContext context) {
    final upcoming = [
      ('CCIS Athlete Selection', 'Aug 17, 2026 • 8:00 AM • Covered Court', AppColors.yellow),
      ('MMSU Unigames', 'Sept 29, 2026 • 8:00 AM • MMSU Grounds', AppColors.navy),
      ('Laro ng Lahi', 'Sept 30, 2026 • 8:00 AM • Covered Court', AppColors.yellow),
    ];
    final history = [
      ('Attendance Recorded', 'Organization Orientation • July 28, 2026 • 12:23 PM\nCCIS Lobby', AppColors.success),
      ('Attendance Failed', 'Freshmen Walk • July 15, 2026 • 7:14 AM\nMMSU Covered Court', AppColors.danger),
      ('Attendance Recorded', 'College Orientation • July 10, 2026 • 7:23 AM\nMMSU Teatro', AppColors.success),
    ];

    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Row(
            children: [
              Expanded(child: _tab('Upcoming Events', !log, () => setState(() => log = false))),
              Expanded(child: _tab('Attendance Log', log, () => setState(() => log = true))),
            ],
          ),
        ),
        const SizedBox(height: 14),
        ...(log ? history : upcoming).map(
          (e) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border(left: BorderSide(color: e.$3, width: 4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(e.$1, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11)),
                const SizedBox(height: 5),
                Text(e.$2, style: const TextStyle(color: AppColors.muted, fontSize: 9)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _tab(String text, bool selected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.all(4),
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: selected
            ? BoxDecoration(color: AppColors.navy, borderRadius: BorderRadius.circular(22))
            : null,
        child: Center(
          child: Text(text, style: TextStyle(color: selected ? Colors.white : AppColors.navy, fontWeight: FontWeight.w600, fontSize: 10)),
        ),
      ),
    );
  }
}
