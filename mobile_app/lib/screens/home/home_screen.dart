import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../models/demo_data.dart';
import '../../widgets/app_header.dart';
import '../../widgets/status_chip.dart';
import '../attendance/location_check_screen.dart';
import '../profile/profile_screen.dart';
import '../auth/login_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _openProfile(BuildContext context) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const ListTile(
                leading: CircleAvatar(backgroundColor: AppColors.goldSoft, child: Icon(Icons.person, color: AppColors.navy)),
                title: Text('Reina Jean Rafanan', style: TextStyle(fontWeight: FontWeight.w900)),
                subtitle: Text('23-140023 • BS Computer Science'),
              ),
              ListTile(
                leading: const Icon(Icons.badge_outlined),
                title: const Text('Personal Information'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
                },
              ),
              ListTile(leading: const Icon(Icons.settings_outlined), title: const Text('Settings'), trailing: const Icon(Icons.chevron_right), onTap: () => Navigator.pop(context)),
              ListTile(leading: const Icon(Icons.info_outline), title: const Text('About'), trailing: const Icon(Icons.chevron_right), onTap: () => Navigator.pop(context)),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.danger),
                title: const Text('Log out', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w800)),
                onTap: () {
                  Navigator.pop(context);
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
                      title: const Icon(Icons.logout, color: AppColors.danger, size: 42),
                      content: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Log Out', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                          SizedBox(height: 6),
                          Text('Are you sure you want to log out?', textAlign: TextAlign.center),
                        ],
                      ),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                        FilledButton(
                          onPressed: () => Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                            (_) => false,
                          ),
                          child: const Text('Yes'),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          AppHeader(onProfileTap: () => _openProfile(context)),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Active event', style: TextStyle(fontSize: 11, color: AppColors.muted)),
                          SizedBox(height: 4),
                          Text('General Assembly', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
                          SizedBox(height: 2),
                          Text('August 14, 2026 • 7:00 AM', style: TextStyle(fontSize: 10, color: AppColors.muted)),
                        ],
                      ),
                    ),
                    StatusChip(activeEvent.status),
                  ],
                ),
                const SizedBox(height: 18),
                InkWell(
                  borderRadius: BorderRadius.circular(22),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LocationCheckScreen())),
                  child: Ink(
                    padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [AppColors.navy, AppColors.blue]),
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [BoxShadow(color: AppColors.navy.withOpacity(.18), blurRadius: 18, offset: const Offset(0, 8))],
                    ),
                    child: const Column(
                      children: [
                        CircleAvatar(radius: 29, backgroundColor: AppColors.gold, child: Icon(Icons.center_focus_strong, color: AppColors.navy, size: 31)),
                        SizedBox(height: 12),
                        Text('Record Attendance', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 17)),
                        SizedBox(height: 5),
                        Text('Check your location, then continue to face capture.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFFE5E2FF), fontSize: 11)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text('Recent Attendance', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.line)),
                  child: Column(
                    children: attendanceHistory.map((event) => ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 3),
                      title: Text(event.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                      subtitle: Text('${event.date} • ${event.time}', style: const TextStyle(fontSize: 9)),
                      trailing: StatusChip(event.status),
                      onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${event.title} selected'))),
                    )).toList(),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
