import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_selector/file_selector.dart';

import '../core/api_endpoints.dart';
import 'api_service.dart';

class RegistrationResult {
  final bool success;
  final String message;
  final Map<String, dynamic>? data;

  const RegistrationResult({
    required this.success,
    required this.message,
    this.data,
  });
}

class RegistrationService {
  RegistrationService._();

  static final RegistrationService instance =
      RegistrationService._();

  final ApiService _api = ApiService.instance;

  Future<RegistrationResult> register({
    required String studentNumber,
    required String surname,
    required String firstname,
    required String middlename,
    required String ext,
    required String email,
    required String password,
    required String passwordConfirmation,
    required XFile profilePhoto,
    required XFile form5,
  }) async {
    try {
      final formData = FormData.fromMap({
        'student_number': studentNumber.trim(),
        'surname': surname.trim(),
        'firstname': firstname.trim(),
        'middlename': middlename.trim().isEmpty
            ? null
            : middlename.trim(),
        'ext': ext.trim().isEmpty
            ? null
            : ext.trim(),
        'email': email.trim(),
        'password': password,
        'password_confirmation': passwordConfirmation,

        'profile_photo': await MultipartFile.fromFile(
          profilePhoto.path,
          filename: profilePhoto.name,
        ),

        'form_5': await MultipartFile.fromFile(
          form5.path,
          filename: form5.name,
        ),
      });

      final response = await _api.dio.post(
        ApiEndpoints.register,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      final raw = response.data;

      if (raw is! Map) {
        return const RegistrationResult(
          success: false,
          message: 'Invalid response from server.',
        );
      }

      final data = Map<String, dynamic>.from(raw);

      final token = data['token'] ??
          data['access_token'];

      if (token != null &&
          token.toString().isNotEmpty) {
        await _api.saveToken(
          token.toString(),
        );
      }

      return RegistrationResult(
        success: true,
        message:
            data['message']?.toString() ??
                'Registration successful.',
        data: data,
      );
    } on DioException catch (e) {
      return RegistrationResult(
        success: false,
        message: _extractErrorMessage(e),
      );
    } catch (e) {
      return RegistrationResult(
        success: false,
        message:
            'Unable to register. Please try again.',
      );
    }
  }

  String _extractErrorMessage(
    DioException exception,
  ) {
    final response =
        exception.response;

    if (response == null) {
      return 'Unable to connect to the server.';
    }

    final raw = response.data;

    if (raw is Map) {
      final data =
          Map<String, dynamic>.from(raw);

      if (data['message'] != null) {
        return data['message'].toString();
      }

      if (data['errors'] is Map) {
        final errors =
            Map<String, dynamic>.from(
          data['errors'] as Map,
        );

        if (errors.isNotEmpty) {
          final first =
              errors.values.first;

          if (first is List &&
              first.isNotEmpty) {
            return first.first.toString();
          }

          return first.toString();
        }
      }
    }

    switch (response.statusCode) {
      case 422:
        return 'Please check your registration information.';
      case 500:
        return 'The server encountered an error.';
      default:
        return 'Registration failed.';
    }
  }
}