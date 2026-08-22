import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../widgets/primary_button.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool editing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
        title: const Text('Personal Information'),
      ),
      body: Column(
        children: [
          const SizedBox(height: 12),
          const CircleAvatar(
            radius: 42,
            backgroundColor: AppColors.gold,
            child: Icon(Icons.person_outline, color: AppColors.navy, size: 46),
          ),
          const SizedBox(height: 10),
          const Text(
            'Reina Jean Rafanan',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const Text(
            'BS Computer Science',
            style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 18),
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  _Field(label: 'First Name', value: 'Reina Jean', enabled: editing),
                  _Field(label: 'Last Name', value: 'Rafanan', enabled: editing),
                  const _Field(label: 'Student Number', value: '23-140023', enabled: false),
                  _Field(label: 'Email Address', value: 'rafananreina@example.com', enabled: editing),
                  _Field(label: 'Program / Section', value: 'BSCS 4A', enabled: editing),
                  const SizedBox(height: 12),
                  PrimaryButton(
                    label: editing ? 'Save Changes' : 'Edit Profile',
                    icon: editing ? Icons.save_outlined : Icons.edit_outlined,
                    onPressed: () {
                      if (editing) {
                        showDialog(
                          context: context,
                          builder: (_) => AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                            title: const Icon(Icons.check_circle, color: AppColors.success, size: 50),
                            content: const Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text('Profile updated', style: TextStyle(fontWeight: FontWeight.w900)),
                                SizedBox(height: 7),
                                Text('Your changes have been saved successfully.', textAlign: TextAlign.center),
                              ],
                            ),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Continue')),
                            ],
                          ),
                        );
                      }
                      setState(() => editing = !editing);
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final String value;
  final bool enabled;
  const _Field({required this.label, required this.value, required this.enabled});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
            const SizedBox(height: 5),
            TextField(enabled: enabled, controller: TextEditingController(text: value)),
          ],
        ),
      );
}
