import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class AppHeader extends StatelessWidget {
  final VoidCallback onProfileTap;
  const AppHeader({super.key, required this.onProfileTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.navy,
      padding: EdgeInsets.only(
        left: 16,
        right: 12,
        top: MediaQuery.of(context).padding.top + 10,
        bottom: 11,
      ),
      child: Row(
        children: [
          Image.asset('assets/images/ccis_logo.png', width: 38, height: 38),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Welcome, Reina', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800)),
                SizedBox(height: 2),
                Text('23-140023', style: TextStyle(color: Color(0xFFD6D3FF), fontSize: 10)),
              ],
            ),
          ),
          IconButton(
            onPressed: onProfileTap,
            icon: const Icon(Icons.account_circle_outlined, color: AppColors.gold, size: 28),
          )
        ],
      ),
    );
  }
}
