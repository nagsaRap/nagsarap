import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../models/demo_data.dart';
import '../../widgets/app_header.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  bool logs = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          AppHeader(onProfileTap: () {}),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppColors.line),
              ),
              child: Row(
                children: [
                  Expanded(child: _TabButton(label: 'Upcoming Events', selected: !logs, onTap: () => setState(() => logs = false))),
                  Expanded(child: _TabButton(label: 'Attendance Log', selected: logs, onTap: () => setState(() => logs = true))),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: logs ? 3 : upcomingEvents.length,
              itemBuilder: (_, i) {
                if (logs) {
                  final data = [
                    ('Attendance Recorded', 'Organization Orientation • July 28, 2026 • 12:23 PM', AppColors.success),
                    ('Attendance Failed', 'Freshmen Walk • July 15, 2026 • 7:14 PM', AppColors.danger),
                    ('Attendance Recorded', 'College Orientation • July 10, 2026 • 7:23 AM', AppColors.success),
                  ][i];
                  return _Card(title: data.$1, subtitle: data.$2, color: data.$3);
                }
                final e = upcomingEvents[i];
                return _Card(
                  title: e.title,
                  subtitle: '${e.date} • ${e.time} • ${e.location}',
                  color: i.isEven ? AppColors.gold : AppColors.navy,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _TabButton({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) => FilledButton(
        onPressed: onTap,
        style: FilledButton.styleFrom(
          backgroundColor: selected ? AppColors.navy : Colors.white,
          foregroundColor: selected ? Colors.white : AppColors.ink,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
      );
}

class _Card extends StatelessWidget {
  final String title;
  final String subtitle;
  final Color color;
  const _Card({required this.title, required this.subtitle, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border(left: BorderSide(color: color, width: 5)),
        ),
        child: ListTile(
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
          subtitle: Text(subtitle, style: const TextStyle(fontSize: 9)),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(title))),
        ),
      );
}
