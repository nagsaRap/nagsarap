import 'package:file_selector/file_selector.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/app_colors.dart';
import '../../widgets/app_text_field.dart';

class RegisterTab extends StatefulWidget {
  const RegisterTab({super.key});

  @override
  State<RegisterTab> createState() => _RegisterTabState();
}

class _RegisterTabState extends State<RegisterTab> {
  /*
  |--------------------------------------------------------------------------
  | CONTROLLERS
  |--------------------------------------------------------------------------
  */

  final TextEditingController studentNumberController = TextEditingController();

  final TextEditingController surnameController = TextEditingController();

  final TextEditingController firstNameController = TextEditingController();

  final TextEditingController middleNameController = TextEditingController();

  final TextEditingController extensionController = TextEditingController();

  final TextEditingController emailController = TextEditingController();

  final TextEditingController passwordController = TextEditingController();

  final TextEditingController confirmPasswordController =
      TextEditingController();

  /*
  |--------------------------------------------------------------------------
  | FILES
  |--------------------------------------------------------------------------
  */

  final ImagePicker imagePicker = ImagePicker();

  XFile? profilePhoto;

  XFile? form5;

  /*
  |--------------------------------------------------------------------------
  | UI STATE
  |--------------------------------------------------------------------------
  */

  bool hidePassword = true;

  bool hideConfirmPassword = true;

  bool validatingPhoto = false;

  bool facePhotoValid = false;

  String? photoValidationMessage;

  /*
  |--------------------------------------------------------------------------
  | DISPOSE
  |--------------------------------------------------------------------------
  */

  @override
  void dispose() {
    studentNumberController.dispose();

    surnameController.dispose();

    firstNameController.dispose();

    middleNameController.dispose();

    extensionController.dispose();

    emailController.dispose();

    passwordController.dispose();

    confirmPasswordController.dispose();

    super.dispose();
  }

  /*
  |--------------------------------------------------------------------------
  | PROFILE PHOTO
  |--------------------------------------------------------------------------
  */

  Future<void> pickProfilePhoto() async {
    try {
      final XFile? image = await imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 95,
      );

      if (image == null) {
        return;
      }

      setState(() {
        profilePhoto = image;

        validatingPhoto = true;

        facePhotoValid = false;

        photoValidationMessage = 'Checking image quality and detecting face...';
      });

      /*
       * TEMPORARY
       *
       * We will replace this next with the actual Laravel
       * image-validation endpoint.
       */

      await Future.delayed(const Duration(milliseconds: 900));

      if (!mounted) {
        return;
      }

      setState(() {
        validatingPhoto = false;

        facePhotoValid = true;

        photoValidationMessage =
            'Face detected. Photo is ready for verification.';
      });
    } catch (e) {
      debugPrint('Reference photo error: $e');

      if (!mounted) {
        return;
      }

      setState(() {
        profilePhoto = null;

        validatingPhoto = false;

        facePhotoValid = false;

        photoValidationMessage = 'Unable to process the selected photo.';
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FORM 5 PICKER
  |--------------------------------------------------------------------------
  |
  | Uses Flutter's official file_selector package.
  |
  */

  Future<void> pickForm5() async {
    try {
      const XTypeGroup pdfType = XTypeGroup(
        label: 'PDF documents',
        extensions: <String>['pdf'],

        /*
         * Helps iOS identify PDFs correctly.
         */
        uniformTypeIdentifiers: <String>['com.adobe.pdf'],

        mimeTypes: <String>['application/pdf'],
      );

      final XFile? selectedFile = await openFile(
        acceptedTypeGroups: <XTypeGroup>[pdfType],
      );

      /*
       * User pressed Cancel.
       */
      if (selectedFile == null) {
        return;
      }

      /*
       * Get file size.
       */
      final int fileSize = await selectedFile.length();

      /*
       * 10 MB maximum.
       */
      const int maxFileSize = 10 * 1024 * 1024;

      if (fileSize > maxFileSize) {
        if (!mounted) {
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Form 5 must not exceed 10 MB.')),
        );

        return;
      }

      /*
       * Extra extension check.
       */
      final String lowerName = selectedFile.name.toLowerCase();

      if (!lowerName.endsWith('.pdf')) {
        if (!mounted) {
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a PDF Form 5.')),
        );

        return;
      }

      setState(() {
        form5 = selectedFile;
      });
    } catch (e) {
      debugPrint('Form 5 picker error: $e');

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Unable to select Form 5.')));
    }
  }

  /*
  |--------------------------------------------------------------------------
  | STUDENT NUMBER FORMAT
  |--------------------------------------------------------------------------
  */

  void formatStudentNumber(String value) {
    String numbers = value.replaceAll(RegExp(r'[^0-9]'), '');

    if (numbers.length > 8) {
      numbers = numbers.substring(0, 8);
    }

    String formatted;

    if (numbers.length > 2) {
      formatted = '${numbers.substring(0, 2)}-${numbers.substring(2)}';
    } else {
      formatted = numbers;
    }

    if (studentNumberController.text != formatted) {
      studentNumberController.value = TextEditingValue(
        text: formatted,
        selection: TextSelection.collapsed(offset: formatted.length),
      );
    }

    setState(() {});
  }

  /*
  |--------------------------------------------------------------------------
  | PASSWORD RULES
  |--------------------------------------------------------------------------
  */

  bool get hasMinimumLength {
    return passwordController.text.length >= 8;
  }

  bool get hasUppercase {
    return RegExp(r'[A-Z]').hasMatch(passwordController.text);
  }

  bool get hasSpecialCharacter {
    return RegExp(r'[!@#$%^&*(),.?":{}|<>_\-+=]')
        .hasMatch(passwordController.text);
  }

  bool get passwordsMatch {
    return passwordController.text.isNotEmpty &&
        passwordController.text == confirmPasswordController.text;
  }

  /*
  |--------------------------------------------------------------------------
  | EMAIL
  |--------------------------------------------------------------------------
  */

  bool get validEmail {
    return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
        .hasMatch(emailController.text.trim());
  }

  /*
  |--------------------------------------------------------------------------
  | STUDENT NUMBER
  |--------------------------------------------------------------------------
  */

  bool get validStudentNumber {
    return RegExp(r'^\d{2}-\d{6}$').hasMatch(studentNumberController.text);
  }

  /*
  |--------------------------------------------------------------------------
  | REGISTER BUTTON
  |--------------------------------------------------------------------------
  */

  bool get canRegister {
    return validStudentNumber &&
        firstNameController.text.trim().isNotEmpty &&
        surnameController.text.trim().isNotEmpty &&
        validEmail &&
        hasMinimumLength &&
        hasUppercase &&
        hasSpecialCharacter &&
        passwordsMatch &&
        profilePhoto != null &&
        facePhotoValid &&
        form5 != null &&
        !validatingPhoto;
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(28, 30, 28, 45),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /*
          |--------------------------------------------------------------------------
          | STUDENT NUMBER
          |--------------------------------------------------------------------------
          */

          AppTextField(
            label: 'Student Number *',
            hint: '23-140012',
            controller: studentNumberController,
            keyboardType: TextInputType.number,
            maxLength: 9,
            helperText: 'Format: YY-NNNNNN (example: 23-140012)',
            textInputAction: TextInputAction.next,
            onChanged: formatStudentNumber,
          ),

          const SizedBox(height: 18),

          /*
          |--------------------------------------------------------------------------
          | NAME
          |--------------------------------------------------------------------------
          */
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: AppTextField(
                  label: 'First Name *',
                  hint: 'First Name',
                  controller: firstNameController,
                  textInputAction: TextInputAction.next,
                  onChanged: (_) {
                    setState(() {});
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AppTextField(
                  label: 'Surname *',
                  hint: 'Surname',
                  controller: surnameController,
                  textInputAction: TextInputAction.next,
                  onChanged: (_) {
                    setState(() {});
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          /*
          |--------------------------------------------------------------------------
          | MIDDLE / EXT
          |--------------------------------------------------------------------------
          */
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: AppTextField(
                  label: 'Middle Name',
                  hint: 'Middle Name',
                  controller: middleNameController,
                  textInputAction: TextInputAction.next,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AppTextField(
                  label: 'Extension',
                  hint: 'Jr.',
                  controller: extensionController,
                  textInputAction: TextInputAction.next,
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          /*
          |--------------------------------------------------------------------------
          | EMAIL
          |--------------------------------------------------------------------------
          */
          AppTextField(
            label: 'Email Address *',
            hint: 'example@email.com',
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            onChanged: (_) {
              setState(() {});
            },
          ),

          if (emailController.text.isNotEmpty && !validEmail) ...[
            const SizedBox(height: 6),
            const Row(
              children: [
                Icon(
                  Icons.error_outline_rounded,
                  size: 14,
                  color: AppColors.error,
                ),
                SizedBox(width: 6),
                Text(
                  'Enter a valid email address',
                  style: TextStyle(fontSize: 10, color: AppColors.error),
                ),
              ],
            ),
          ],

          const SizedBox(height: 18),

          /*
          |--------------------------------------------------------------------------
          | PASSWORD
          |--------------------------------------------------------------------------
          */
          AppTextField(
            label: 'Set Password *',
            hint: 'Enter your password',
            controller: passwordController,
            obscureText: hidePassword,
            textInputAction: TextInputAction.next,
            onChanged: (_) {
              setState(() {});
            },
            suffixIcon: IconButton(
              onPressed: () {
                setState(() {
                  hidePassword = !hidePassword;
                });
              },
              icon: Icon(
                hidePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
              ),
            ),
          ),

          const SizedBox(height: 10),

          _PasswordRequirement(
            passed: hasMinimumLength,
            text: 'At least 8 characters',
          ),

          _PasswordRequirement(
            passed: hasUppercase,
            text: 'At least one uppercase letter',
          ),

          _PasswordRequirement(
            passed: hasSpecialCharacter,
            text: 'At least one special character',
          ),

          const SizedBox(height: 18),

          /*
          |--------------------------------------------------------------------------
          | CONFIRM PASSWORD
          |--------------------------------------------------------------------------
          */
          AppTextField(
            label: 'Confirm Password *',
            hint: 'Confirm your password',
            controller: confirmPasswordController,
            obscureText: hideConfirmPassword,
            textInputAction: TextInputAction.done,
            onChanged: (_) {
              setState(() {});
            },
            suffixIcon: IconButton(
              onPressed: () {
                setState(() {
                  hideConfirmPassword = !hideConfirmPassword;
                });
              },
              icon: Icon(
                hideConfirmPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
              ),
            ),
          ),

          if (confirmPasswordController.text.isNotEmpty) ...[
            const SizedBox(height: 7),
            Row(
              children: [
                Icon(
                  passwordsMatch
                      ? Icons.check_circle_rounded
                      : Icons.cancel_rounded,
                  size: 15,
                  color: passwordsMatch ? AppColors.success : AppColors.error,
                ),
                const SizedBox(width: 6),
                Text(
                  passwordsMatch ? 'Passwords match' : 'Passwords do not match',
                  style: TextStyle(
                    fontSize: 11,
                    color: passwordsMatch ? AppColors.success : AppColors.error,
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 26),

          /*
          |--------------------------------------------------------------------------
          | PROFILE PHOTO
          |--------------------------------------------------------------------------
          */
          const Text(
            'Reference Photo *',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),

          const SizedBox(height: 5),

          const Text(
            'Upload a clear photo with one visible face. The system will check image quality before registration.',
            style: TextStyle(
              fontSize: 11,
              height: 1.4,
              color: AppColors.textSecondary,
            ),
          ),

          const SizedBox(height: 10),

          InkWell(
            onTap: validatingPhoto ? null : pickProfilePhoto,
            borderRadius: BorderRadius.circular(16),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: facePhotoValid ? AppColors.success : AppColors.gold,
                  width: 1.3,
                ),
              ),
              child: Column(
                children: [
                  if (validatingPhoto)
                    const SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        color: AppColors.navy,
                      ),
                    )
                  else
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: facePhotoValid
                            ? AppColors.success.withValues(alpha: .10)
                            : AppColors.navy.withValues(alpha: .07),
                      ),
                      child: Icon(
                        facePhotoValid
                            ? Icons.check_circle_rounded
                            : Icons.add_a_photo_outlined,
                        color: facePhotoValid
                            ? AppColors.success
                            : AppColors.navy,
                        size: 31,
                      ),
                    ),

                  const SizedBox(height: 11),

                  Text(
                    profilePhoto?.name ?? 'Upload Reference Photo',
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),

                  const SizedBox(height: 5),

                  Text(
                    validatingPhoto
                        ? 'Checking image...'
                        : photoValidationMessage ?? 'JPG, JPEG, PNG or HEIC',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11,
                      color: facePhotoValid
                          ? AppColors.success
                          : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 22),

          /*
          |--------------------------------------------------------------------------
          | FORM 5
          |--------------------------------------------------------------------------
          */
          const Text(
            'Form 5 Document *',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),

          const SizedBox(height: 5),

          const Text(
            'Upload your current Form 5 for student information verification.',
            style: TextStyle(
              fontSize: 11,
              height: 1.4,
              color: AppColors.textSecondary,
            ),
          ),

          const SizedBox(height: 10),

          InkWell(
            onTap: pickForm5,
            borderRadius: BorderRadius.circular(16),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: form5 != null ? AppColors.success : AppColors.gold,
                  width: 1.3,
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: form5 != null
                          ? AppColors.success.withValues(alpha: .10)
                          : AppColors.navy.withValues(alpha: .07),
                    ),
                    child: Icon(
                      form5 != null
                          ? Icons.check_circle_outline_rounded
                          : Icons.upload_file_outlined,
                      color: form5 != null ? AppColors.success : AppColors.navy,
                      size: 31,
                    ),
                  ),

                  const SizedBox(height: 10),

                  Text(
                    form5?.name ?? 'Upload your Form 5',
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),

                  const SizedBox(height: 4),

                  const Text(
                    'PDF only • Maximum 10 MB',
                    style: TextStyle(fontSize: 10, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 30),

          /*
          |--------------------------------------------------------------------------
          | REGISTER
          |--------------------------------------------------------------------------
          */
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: canRegister
                  ? () {
                      /*
                           * API registration
                           * goes here next.
                           */
                    }
                  : null,
              child: const Text('Create Student Account'),
            ),
          ),

          const SizedBox(height: 15),

          const Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Your information and reference photo will be verified before account activation.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  height: 1.5,
                  color: AppColors.textMuted,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/*
|--------------------------------------------------------------------------
| PASSWORD REQUIREMENT
|--------------------------------------------------------------------------
*/

class _PasswordRequirement extends StatelessWidget {
  final bool passed;

  final String text;

  const _PasswordRequirement({required this.passed, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Row(
        children: [
          Icon(
            passed ? Icons.check_circle_rounded : Icons.circle_outlined,
            size: 14,
            color: passed ? AppColors.success : AppColors.textMuted,
          ),
          const SizedBox(width: 7),
          Text(
            text,
            style: TextStyle(
              fontSize: 10,
              color: passed ? AppColors.success : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
