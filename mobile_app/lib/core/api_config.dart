class ApiConfig {
  ApiConfig._();

  /*
   * Android emulator:
   * 10.0.2.2 points to your Mac's localhost.
   *
   * Later on a physical phone, this will be changed
   * to your Mac's local network IP or production HTTPS URL.
   */
  static const String baseUrl = 'http://10.0.2.2:8000';
}
