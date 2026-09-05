class ApiConfig {
  ApiConfig._();

  /*
  |--------------------------------------------------------------------------
  | DEVELOPMENT API
  |--------------------------------------------------------------------------
  |
  | Android emulator:
  | 10.0.2.2 points to your Mac localhost.
  |
  | Laravel:
  | php artisan serve --host=0.0.0.0 --port=8000
  |
  | Production later:
  | https://attendance.yourschool.edu
  |
  */

  static const String baseUrl = 'http://10.0.2.2:8000';

  static const Duration connectTimeout = Duration(seconds: 20);

  static const Duration receiveTimeout = Duration(seconds: 30);

  static const Duration sendTimeout = Duration(seconds: 30);
}
