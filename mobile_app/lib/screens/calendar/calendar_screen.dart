import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/app_theme.dart';
import '../../widgets/app_header.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime selected = DateTime(2026, 8, 14);

  @override
  Widget build(BuildContext context) {
    final first = DateTime(selected.year, selected.month, 1);
    final days = DateUtils.getDaysInMonth(selected.year, selected.month);
    final offset = first.weekday % 7;

    return Scaffold(
      body: Column(
        children: [
          AppHeader(onProfileTap: () {}),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.line),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          IconButton(
                            onPressed: () => setState(() => selected = DateTime(selected.year, selected.month - 1, 1)),
                            icon: const Icon(Icons.chevron_left),
                          ),
                          Expanded(
                            child: Text(
                              DateFormat('MMMM yyyy').format(selected),
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                            ),
                          ),
                          IconButton(
                            onPressed: () => setState(() => selected = DateTime(selected.year, selected.month + 1, 1)),
                            icon: const Icon(Icons.chevron_right),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          for (final d in const ['S', 'M', 'T', 'W', 'T', 'F', 'S'])
                            Expanded(
                              child: Center(
                                child: Text(
                                  d,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 7),
                        itemCount: offset + days,
                        itemBuilder: (_, i) {
                          if (i < offset) return const SizedBox();
                          final day = i - offset + 1;
                          final isSelected = day == selected.day;
                          return InkWell(
                            borderRadius: BorderRadius.circular(99),
                            onTap: () => setState(() => selected = DateTime(selected.year, selected.month, day)),
                            child: Container(
                              margin: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.navy : Colors.transparent,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  '$day',
                                  style: TextStyle(color: isSelected ? Colors.white : AppColors.ink, fontSize: 11),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Events on ${DateFormat('MMMM d, yyyy').format(selected)}',
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.line),
                  ),
                  child: const ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: AppColors.goldSoft,
                      child: Icon(Icons.event, color: AppColors.navy),
                    ),
                    title: Text('General Assembly', style: TextStyle(fontWeight: FontWeight.w900)),
                    subtitle: Text('7:00 AM – 8:00 AM • CCIS Lobby 1'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
