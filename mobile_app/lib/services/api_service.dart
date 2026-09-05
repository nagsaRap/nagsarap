import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/api_config.dart';

class ApiService {
  ApiService._();

  static final ApiService instance = ApiService._();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  late final Dio dio =
      Dio(
          BaseOptions(
            baseUrl: ApiConfig.baseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 30),
            sendTimeout: const Duration(seconds: 30),
            headers: {'Accept': 'application/json'},
          ),
        )
        ..interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) async {
              final token = await _storage.read(key: 'auth_token');

              if (token != null && token.isNotEmpty) {
                options.headers['Authorization'] = 'Bearer $token';
              }

              handler.next(options);
            },
          ),
        );

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return _storage.read(key: 'auth_token');
  }

  Future<void> removeToken() async {
    await _storage.delete(key: 'auth_token');
  }
}
