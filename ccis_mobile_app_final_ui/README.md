# CCIS Student Attendance Mobile App — Final UI + Device Preview

Target environment:
- Flutter 3.47.0
- Dart 3.13.0
- Android SDK 36/37 compatible

Included:
- Reworked UI based on the supplied CCIS logo
- Navy + orange/gold visual system
- Login / Register
- Home / Recent Attendance
- Profile sheet + logout confirmation
- Personal Information / Edit Profile
- Notifications / Attendance Log
- Calendar
- Clickable navigation and buttons
- Location permission flow and REAL device coordinates
- Location loading state
- Camera permission flow and REAL camera preview
- Real photo capture only

Not connected yet:
- Face recognition
- Liveness detection
- OCR
- Real event geofence comparison
- Backend/API/MySQL/Laravel
- Offline queue/sync
- SMS

Important:
The real camera and GPS are device-side Flutter features, not backend features.
The backend will later provide event coordinates/radius, identity data, event windows,
attendance storage, sync, approval, and server-side rules.

Install into your existing mobile_app:
1. Back up your current lib/ folder.
2. Replace lib/ with this package's lib/.
3. Copy assets/images/ccis_logo.png.
4. Merge/replace pubspec.yaml.
5. Add the AndroidManifest permissions.
6. Run:
   flutter clean
   flutter pub get
   flutter run

Emulator note:
An Android emulator may use a virtual camera or simulated GPS. Use a physical Android
phone to verify true camera/GPS behavior.
