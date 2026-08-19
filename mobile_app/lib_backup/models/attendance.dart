class Attendance {
  final String id;
  final String studentId;
  final String eventId;

  final DateTime attendanceTime;
  final DateTime? syncTime;

  final String status;
  final bool isSynced;

  Attendance({
    required this.id,
    required this.studentId,
    required this.eventId,
    required this.attendanceTime,
    this.syncTime,
    required this.status,
    required this.isSynced,
  });
}