import 'package:ccis_attendance/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('CCIS Attendance application loads', (WidgetTester tester) async {
    await tester.pumpWidget(const CcisAttendanceApp());

    await tester.pumpAndSettle();

    expect(find.text('Student Attendance System'), findsOneWidget);

    expect(find.text('Log in'), findsWidgets);

    expect(find.text('Register'), findsWidgets);
  });
}
