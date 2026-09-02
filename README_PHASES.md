# CCIS Attendance — Backend/Web Completion Pack

This pack is designed for the Laravel project you uploaded (`nagsarap`). It completes the backend/web work needed before Flutter integration:

1. Geofence editor + backend enforcement
2. MediaPipe liveness challenge on web attendance
3. Attendance time-window + Present/Late rules
4. Shared `AttendanceService`
5. Laravel Sanctum mobile API
6. Standard JSON responses + curl tests
7. Offline-sync API with `attendance_time` separate from `sync_time`
8. Role protection for event management

## IMPORTANT

Your local project already has the two geofence migrations created on Sep 2:
- `add_geofence_to_events_table`
- `add_geofence_data_to_attendances_table`

Do NOT create those again. This pack only adds the remaining lifecycle migration.

## Install commands

From the Laravel root:

```bash
php artisan install:api
npm install leaflet
npm install -D @types/leaflet
php artisan make:middleware EnsureRole
php artisan optimize:clear
php artisan migrate
npm run build
```

Python service (recommended Python 3.11):

```bash
cd python-services/face-verification
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Development:

```bash
composer run dev
```

In another terminal:

```bash
cd python-services/face-verification
source venv/bin/activate
python app.py
```

## Copy files

Copy every file in this pack to the same relative path in your `nagsarap` project. Review `.env.additions` and append those settings to your existing `.env` instead of replacing it.

Then run:

```bash
php artisan optimize:clear
php artisan migrate
npm run types:check
php artisan route:list --path=api
```

## Offline rule

`attendance_time` is the time the device captured the verified attendance attempt. `sync_time` is when Laravel receives it. Present/Late is determined from `attendance_time`, never `sync_time`.
