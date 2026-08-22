class DemoEvent {
  final String title;
  final String date;
  final String time;
  final String location;
  final String status;

  const DemoEvent({
    required this.title,
    required this.date,
    required this.time,
    required this.location,
    required this.status,
  });
}

const activeEvent = DemoEvent(
  title: 'General Assembly',
  date: 'August 14, 2026',
  time: '7:00 AM – 8:00 AM',
  location: 'CCIS Lobby 1',
  status: 'Ongoing',
);

const attendanceHistory = [
  DemoEvent(title: 'Flag Ceremony', date: 'Aug 3, 2026', time: '6:55 AM', location: 'MMSU Oval', status: 'Present'),
  DemoEvent(title: 'Organization Orientation', date: 'July 28, 2026', time: '12:23 PM', location: 'CCIS Lobby 1', status: 'Present'),
  DemoEvent(title: 'Freshmen Walk', date: 'July 15, 2026', time: '7:14 PM', location: 'Main Campus', status: 'Absent'),
  DemoEvent(title: 'College Orientation', date: 'July 10, 2026', time: '7:23 AM', location: 'CCIS Lobby 1', status: 'Present'),
];

const upcomingEvents = [
  DemoEvent(title: 'CCIS Athlete Selection', date: 'Aug 17, 2026', time: '8:00 AM', location: 'Covered Court', status: 'Upcoming'),
  DemoEvent(title: 'MMSU Unigames', date: 'Sept 29, 2026', time: '8:00 AM', location: 'MMSU Grounds', status: 'Upcoming'),
  DemoEvent(title: 'Laro ng Lahi', date: 'Sept 30, 2026', time: '8:00 AM', location: 'Covered Court', status: 'Upcoming'),
];
