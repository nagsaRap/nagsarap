import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class AppHeader extends StatelessWidget {
  final VoidCallback? onProfileTap;
  const AppHeader({super.key, this.onProfileTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.navy,
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            const CircleAvatar(
              radius: 17,
              backgroundColor: Colors.white,
              child: Icon(Icons.school_rounded, color: AppColors.navy, size: 20),
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Welcome, Reina',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                  Text('23-140023',
                      style: TextStyle(color: Colors.white70, fontSize: 10)),
                ],
              ),
            ),
            InkWell(
              onTap: onProfileTap,
              borderRadius: BorderRadius.circular(50),
              child: const Padding(
                padding: EdgeInsets.all(4),
                child: Icon(Icons.account_circle_outlined, color: AppColors.yellow, size: 28),
              ),
            )
          ],
        ),
      ),
    );
  }
}
