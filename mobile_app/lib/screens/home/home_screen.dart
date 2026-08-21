import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';
import '../../widgets/permission_dialogs.dart';
import '../attendance/scan_screen.dart';
import '../profile/personal_info_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _openProfileMenu(BuildContext context) {
    showMenu(
      context: context,
      position: const RelativeRect.fromLTRB(
        155,
        85,
        12,
        0,
      ),
      items: [
        const PopupMenuItem(
          enabled: false,``
          child: Text(
            '●  Reina Rafanan\n    23-140023',
            style: TextStyle(
              fontWeight: FontWeight.w700,
            ),
          ),
        ),

        PopupMenuItem(
          onTap: () {
            Future.delayed(
              Duration.zero,
              () {
                if (!context.mounted) return;

                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        const PersonalInfoScreen(),
                  ),
                );
              },
            );
          },
          child: const ListTile(
            dense: true,
            leading: Icon(
              Icons.person_outline,
            ),
            title: Text(
              'Personal Information',
              style: TextStyle(
                fontSize: 12,
              ),
            ),
          ),
        ),

        const PopupMenuItem(
          child: ListTile(
            dense: true,
            leading: Icon(
              Icons.settings_outlined,
            ),
            title: Text(
              'Settings',
              style: TextStyle(
                fontSize: 12,
              ),
            ),
          ),
        ),

        const PopupMenuItem(
          child: ListTile(
            dense: true,
            leading: Icon(
              Icons.info_outline,
            ),
            title: Text(
              'About',
              style: TextStyle(
                fontSize: 12,
              ),
            ),
          ),
        ),

        PopupMenuItem(
          onTap: () {
            Future.delayed(
              Duration.zero,
              () {
                if (!context.mounted) return;

                _logoutDialog(context);
              },
            );
          },
          child: const ListTile(
            dense: true,
            leading: Icon(
              Icons.logout,
              color: Colors.red,
            ),
            title: Text(
              'Log Out',
              style: TextStyle(
                color: Colors.red,
                fontSize: 12,
              ),
            ),
          ),
        ),
      ],
    );
  }

  static void _logoutDialog(
    BuildContext context,
  ) {
    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius:
                BorderRadius.circular(18),
          ),
          title: const Icon(
            Icons.logout,
            color: Colors.red,
            size: 38,
          ),
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Log Out',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 17,
                ),
              ),
              SizedBox(height: 6),
              Text(
                'Are you sure you want to log out?',
                style: TextStyle(
                  fontSize: 11,
                ),
              ),
            ],
          ),
          actionsAlignment:
              MainAxisAlignment.center,
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style:
                  ElevatedButton.styleFrom(
                backgroundColor:
                    AppColors.navy,
                foregroundColor:
                    Colors.white,
              ),
              onPressed: () {
                Navigator.pop(context);

                Navigator.of(context)
                    .popUntil(
                  (route) => route.isFirst,
                );
              },
              child: const Text('Yes'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _recordAttendance(
    BuildContext context,
  ) async {
    // STEP 1: Location permission UI
    final locationAllowed =
        await PermissionDialogs
            .showLocationPermission(
      context,
    );

    if (!context.mounted) return;

    if (locationAllowed != true) {
      await PermissionDialogs
          .showLocationFailed(
        context,
        () {},
      );

      return;
    }

    // STEP 2: Camera permission UI
    final cameraAllowed =
        await PermissionDialogs
            .showCameraPermission(
      context,
    );

    if (!context.mounted) return;

    if (cameraAllowed != true) {
      await PermissionDialogs
          .showCameraFailed(
        context,
        () {},
      );

      return;
    }

    // STEP 3: Open scanner
    if (!context.mounted) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            const ScanScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final records = [
      (
        'Flag Ceremony',
        'Aug 3, 2026 • 6:59 AM',
        'Present',
        AppColors.success
      ),
      (
        'Organization Orientation',
        'July 28, 2026 • 12:23 PM',
        'Present',
        AppColors.success
      ),
      (
        'Freshmen Walk',
        'July 15, 2026 • 7:14 PM',
        'Absent',
        AppColors.danger
      ),
      (
        'College Orientation',
        'July 10, 2026 • 7:23 AM',
        'Present',
        AppColors.success
      ),
    ];

    return Scaffold(
      backgroundColor:
          AppColors.background,

      body: ListView(
        padding:
            const EdgeInsets.fromLTRB(
          14,
          16,
          14,
          18,
        ),

        children: [
          // ACTIVE EVENT
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment
                          .start,
                  children: [
                    Text(
                      'Active event',
                      style: TextStyle(
                        color:
                            AppColors.muted,
                        fontSize: 10,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'General Assembly',
                      style: TextStyle(
                        fontWeight:
                            FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      'August 14, 2026 • 7:23 AM',
                      style: TextStyle(
                        color:
                            AppColors.muted,
                        fontSize: 9,
                      ),
                    ),
                  ],
                ),
              ),

              Container(
                padding:
                    const EdgeInsets
                        .symmetric(
                  horizontal: 12,
                  vertical: 5,
                ),
                decoration:
                    BoxDecoration(
                  color:
                      const Color(
                    0xFFFFE99C,
                  ),
                  borderRadius:
                      BorderRadius
                          .circular(20),
                ),
                child: const Text(
                  'Ongoing',
                  style: TextStyle(
                    fontSize: 9,
                    color: Colors.orange,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 26),

          // RECORD ATTENDANCE CARD
          InkWell(
            onTap: () {
              _recordAttendance(
                context,
              );
            },
            borderRadius:
                BorderRadius.circular(
              18,
            ),
            child: Container(
              width: double.infinity,
              padding:
                  const EdgeInsets
                      .symmetric(
                vertical: 20,
              ),
              decoration:
                  BoxDecoration(
                color: AppColors.navy,
                borderRadius:
                    BorderRadius
                        .circular(18),
              ),
              child: const Column(
                children: [
                  CircleAvatar(
                    radius: 25,
                    backgroundColor:
                        AppColors.yellow,
                    child: Icon(
                      Icons
                          .center_focus_strong,
                      color:
                          AppColors.navy,
                      size: 28,
                    ),
                  ),

                  SizedBox(height: 10),

                  Text(
                    'Record Attendance',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight:
                          FontWeight.w700,
                    ),
                  ),

                  SizedBox(height: 4),

                  Text(
                    'Click the Scanner to proceed with recording\n'
                    'your attendance',
                    textAlign:
                        TextAlign.center,
                    style: TextStyle(
                      color:
                          Colors.white70,
                      fontSize: 9,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 14),

          // ATTENDANCE RECORDS
          Container(
            padding:
                const EdgeInsets.all(
              14,
            ),
            decoration:
                BoxDecoration(
              color:
                  const Color(
                0xFFEDEDED,
              ),
              borderRadius:
                  BorderRadius.circular(
                18,
              ),
            ),
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,
              children: [
                const Text(
                  'Record Attendance',
                  style: TextStyle(
                    fontWeight:
                        FontWeight.w600,
                    fontSize: 11,
                  ),
                ),

                const SizedBox(
                  height: 8,
                ),

                ...records.map(
                  (record) {
                    return Padding(
                      padding:
                          const EdgeInsets
                              .symmetric(
                        vertical: 7,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child:
                                Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment
                                      .start,
                              children: [
                                Text(
                                  record.$1,
                                  style:
                                      const TextStyle(
                                    fontSize:
                                        11,
                                    fontWeight:
                                        FontWeight
                                            .w600,
                                  ),
                                ),
                                Text(
                                  record.$2,
                                  style:
                                      const TextStyle(
                                    fontSize:
                                        8,
                                    color:
                                        AppColors
                                            .muted,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          Container(
                            width: 64,
                            padding:
                                const EdgeInsets
                                    .symmetric(
                              vertical: 5,
                            ),
                            decoration:
                                BoxDecoration(
                              color: record
                                  .$4
                                  .withOpacity(
                                    0.13,
                                  ),
                              borderRadius:
                                  BorderRadius
                                      .circular(
                                20,
                              ),
                            ),
                            child: Text(
                              record.$3,
                              textAlign:
                                  TextAlign
                                      .center,
                              style:
                                  TextStyle(
                                fontSize: 9,
                                color:
                                    record.$4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static void openProfileMenu(
    BuildContext context,
  ) {
    const HomeScreen()
        ._openProfileMenu(
      context,
    );
  }
}