import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  final double size;
  final bool withText;
  const AppLogo({super.key, this.size = 64, this.withText = true});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset('assets/images/ccis_logo.png', width: size, height: size, fit: BoxFit.contain),
        if (withText) ...[
          const SizedBox(height: 10),
          const Text('CCIS', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
          const SizedBox(height: 2),
          const Text('Student Attendance System', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ],
    );
  }
}
