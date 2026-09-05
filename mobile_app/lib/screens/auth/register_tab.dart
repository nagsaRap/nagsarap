import 'package:file_selector/file_selector.dart' as fs;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/app_colors.dart';
import '../../services/registration_service.dart';
import '../../widgets/app_dialog.dart';
import '../../widgets/app_text_field.dart';

class RegisterTab extends StatefulWidget {
  const RegisterTab({
    super.key,
  });

  @override
  State<RegisterTab> createState() => _RegisterTabState();
}

class _RegisterTabState extends State<RegisterTab> {
  /*
  |--------------------------------------------------------------------------
  | CONTROLLERS
  |--------------------------------------------------------------------------
  */

  final TextEditingController studentNumberController =
      TextEditingController();

  final TextEditingController surnameController =
      TextEditingController();

  final TextEditingController firstNameController =
      TextEditingController();

  final TextEditingController middleNameController =
      TextEditingController();

  final TextEditingController extensionController =
      TextEditingController();

  final TextEditingController emailController =
      TextEditingController();

  final TextEditingController passwordController =
      TextEditingController();

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

  bool registering = false;

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
    if (validatingPhoto || registering) {
      return;
    }

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

        photoValidationMessage =
            'Checking image quality and detecting face...';
      });

      /*
      |--------------------------------------------------------------------------
      | TEMPORARY PHOTO VALIDATION
      |--------------------------------------------------------------------------
      |
      | This is intentionally temporary.
      |
      | In the next stage we will replace this with:
      |
      | Flutter
      |   ↓
      | Laravel image validation endpoint
      |   ↓
      | FaceService
      |   ↓
      | Python OpenCV + InsightFace
      |
      | Checks:
      | - image can be decoded
      | - image is not too blurry
      | - exactly one face is detected
      | - face is usable for embedding
      |
      */

      await Future.delayed(
        const Duration(
          milliseconds: 900,
        ),
      );

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
      debugPrint(
        'Reference photo error: $e',
      );

      if (!mounted) {
        return;
      }

      setState(() {
        profilePhoto = null;
        validatingPhoto = false;
        facePhotoValid = false;

        photoValidationMessage =
            'Unable to process the selected photo.';
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FORM 5 PICKER
  |--------------------------------------------------------------------------
  */

  Future<void> pickForm5() async {
    if (registering) {
      return;
    }

    try {
      const fs.XTypeGroup pdfType = fs.XTypeGroup(
        label: 'PDF documents',
        extensions: <String>[
          'pdf',
        ],
        uniformTypeIdentifiers: <String>[
          'com.adobe.pdf',
        ],
        mimeTypes: <String>[
          'application/pdf',
        ],
      );

      final XFile? selectedFile = await fs.openFile(
        acceptedTypeGroups: <fs.XTypeGroup>[
          pdfType,
        ],
      );

      if (selectedFile == null) {
        return;
      }

      /*
       * 10 MB maximum.
       */

      final int fileSize =
          await selectedFile.length();

      const int maxFileSize =
          10 * 1024 * 1024;

      if (fileSize > maxFileSize) {
        if (!mounted) {
          return;
        }

        await showSimpleError(
          title: 'File Too Large',
          message:
              'Your Form 5 must not exceed 10 MB.',
        );

        return;
      }

      /*
       * Extra extension protection.
       */

      final String lowerName =
          selectedFile.name.toLowerCase();

      if (!lowerName.endsWith('.pdf')) {
        if (!mounted) {
          return;
        }

        await showSimpleError(
          title: 'Invalid Form 5',
          message:
              'Please select a PDF copy of your Form 5.',
        );

        return;
      }

      setState(() {
        form5 = selectedFile;
      });
    } catch (e) {
      debugPrint(
        'Form 5 picker error: $e',
      );

      if (!mounted) {
        return;
      }

      await showSimpleError(
        title: 'Unable to Select File',
        message:
            'The Form 5 could not be selected. Please try again.',
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE PHOTO
  |--------------------------------------------------------------------------
  */

  void removeProfilePhoto() {
    if (registering) {
      return;
    }

    setState(() {
      profilePhoto = null;
      facePhotoValid = false;
      validatingPhoto = false;
      photoValidationMessage = null;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE FORM 5
  |--------------------------------------------------------------------------
  */

  void removeForm5() {
    if (registering) {
      return;
    }

    setState(() {
      form5 = null;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | STUDENT NUMBER FORMAT
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | 23140012
  |
  | becomes:
  |
  | 23-140012
  |
  */

  void formatStudentNumber(
    String value,
  ) {
    String numbers = value.replaceAll(
      RegExp(
        r'[^0-9]',
      ),
      '',
    );

    if (numbers.length > 8) {
      numbers = numbers.substring(
        0,
        8,
      );
    }

    String formatted;

    if (numbers.length > 2) {
      formatted =
          '${numbers.substring(0, 2)}-${numbers.substring(2)}';
    } else {
      formatted = numbers;
    }

    if (studentNumberController.text !=
        formatted) {
      studentNumberController.value =
          TextEditingValue(
        text: formatted,
        selection:
            TextSelection.collapsed(
          offset: formatted.length,
        ),
      );
    }

    setState(() {});
  }

  /*
  |--------------------------------------------------------------------------
  | PASSWORD VALIDATION
  |--------------------------------------------------------------------------
  */

  bool get hasMinimumLength {
    return passwordController.text.length >=
        8;
  }

  bool get hasUppercase {
    return RegExp(
      r'[A-Z]',
    ).hasMatch(
      passwordController.text,
    );
  }

  bool get hasSpecialCharacter {
    return RegExp(
      r'[!@#$%^&*(),.?":{}|<>_\-+=]',
    ).hasMatch(
      passwordController.text,
    );
  }

  bool get passwordsMatch {
    return passwordController
            .text.isNotEmpty &&
        passwordController.text ==
            confirmPasswordController.text;
  }

  /*
  |--------------------------------------------------------------------------
  | EMAIL VALIDATION
  |--------------------------------------------------------------------------
  */

  bool get validEmail {
    return RegExp(
      r'^[^@\s]+@[^@\s]+\.[^@\s]+$',
    ).hasMatch(
      emailController.text.trim(),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | STUDENT NUMBER VALIDATION
  |--------------------------------------------------------------------------
  */

  bool get validStudentNumber {
    return RegExp(
      r'^\d{2}-\d{6}$',
    ).hasMatch(
      studentNumberController.text.trim(),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | REGISTER BUTTON
  |--------------------------------------------------------------------------
  */

  bool get canRegister {
    return validStudentNumber &&
        firstNameController.text
            .trim()
            .isNotEmpty &&
        surnameController.text
            .trim()
            .isNotEmpty &&
        validEmail &&
        hasMinimumLength &&
        hasUppercase &&
        hasSpecialCharacter &&
        passwordsMatch &&
        profilePhoto != null &&
        facePhotoValid &&
        form5 != null &&
        !validatingPhoto &&
        !registering;
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT REGISTRATION
  |--------------------------------------------------------------------------
  */

  Future<void> submitRegistration() async {
    if (!canRegister || registering) {
      return;
    }

    final XFile? selectedPhoto =
        profilePhoto;

    final XFile? selectedForm5 =
        form5;

    if (selectedPhoto == null ||
        selectedForm5 == null) {
      await showSimpleError(
        title: 'Missing Documents',
        message:
            'Please upload both your reference photo and Form 5.',
      );

      return;
    }

    FocusScope.of(context).unfocus();

    setState(() {
      registering = true;
    });

    final result =
        await RegistrationService.instance
            .register(
      studentNumber:
          studentNumberController.text
              .trim(),
      surname:
          surnameController.text.trim(),
      firstname:
          firstNameController.text.trim(),
      middlename:
          middleNameController.text.trim(),
      ext:
          extensionController.text.trim(),
      email:
          emailController.text.trim(),
      password:
          passwordController.text,
      passwordConfirmation:
          confirmPasswordController.text,
      profilePhoto: selectedPhoto,
      form5: selectedForm5,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      registering = false;
    });

    if (!result.success) {
      await showDialog<void>(
        context: context,
        builder: (
          BuildContext dialogContext,
        ) {
          return AppDialog(
            type: AppDialogType.error,
            title: 'Registration Failed',
            message: result.message,
            primaryText: 'Try Again',
            primaryAction: () {
              Navigator.of(
                dialogContext,
              ).pop();
            },
          );
        },
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | We do NOT send the student directly to the final dashboard here.
    |
    | Registration is only the first part.
    |
    | Next stage:
    | Registration
    |     ↓
    | Live face/liveness verification
    |     ↓
    | Account verified
    |     ↓
    | Dashboard
    |
    */

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (
        BuildContext dialogContext,
      ) {
        return AppDialog(
          type: AppDialogType.success,
          title:
              'Registration Successful',
          message:
              'Your account has been created. The next step is to verify your identity using live facial verification.',
          primaryText: 'Continue',
          primaryAction: () {
            Navigator.of(
              dialogContext,
            ).pop();
          },
        );
      },
    );

    if (!mounted) {
      return;
    }

    /*
     * For Stage 12 we leave the student here.
     *
     * In the NEXT STAGE, this exact position
     * will navigate to:
     *
     * RegistrationFaceVerificationScreen()
     *
     * We do not create a fake dashboard redirect,
     * because your system requires registration
     * liveness + face verification first.
     */
  }

  /*
  |--------------------------------------------------------------------------
  | SIMPLE ERROR DIALOG
  |--------------------------------------------------------------------------
  */

  Future<void> showSimpleError({
    required String title,
    required String message,
  }) async {
    if (!mounted) {
      return;
    }

    await showDialog<void>(
      context: context,
      builder: (
        BuildContext dialogContext,
      ) {
        return AppDialog(
          type: AppDialogType.error,
          title: title,
          message: message,
          primaryText: 'Okay',
          primaryAction: () {
            Navigator.of(
              dialogContext,
            ).pop();
          },
        );
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | BUILD
  |--------------------------------------------------------------------------
  */

  @override
  Widget build(
    BuildContext context,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        28,
        30,
        28,
        45,
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          /*
          |--------------------------------------------------------------------------
          | STUDENT NUMBER
          |--------------------------------------------------------------------------
          */

          AppTextField(
            label: 'Student Number *',
            hint: '23-140012',
            controller:
                studentNumberController,
            keyboardType:
                TextInputType.number,
            maxLength: 9,
            helperText:
                'Format: YY-NNNNNN (example: 23-140012)',
            textInputAction:
                TextInputAction.next,
            onChanged:
                formatStudentNumber,
          ),

          const SizedBox(
            height: 18,
          ),

          /*
          |--------------------------------------------------------------------------
          | FIRST NAME + SURNAME
          |--------------------------------------------------------------------------
          */

          Row(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Expanded(
                child: AppTextField(
                  label: 'First Name *',
                  hint: 'First Name',
                  controller:
                      firstNameController,
                  textInputAction:
                      TextInputAction.next,
                  onChanged: (_) {
                    setState(() {});
                  },
                ),
              ),
              const SizedBox(
                width: 12,
              ),
              Expanded(
                child: AppTextField(
                  label: 'Surname *',
                  hint: 'Surname',
                  controller:
                      surnameController,
                  textInputAction:
                      TextInputAction.next,
                  onChanged: (_) {
                    setState(() {});
                  },
                ),
              ),
            ],
          ),

          const SizedBox(
            height: 18,
          ),

          /*
          |--------------------------------------------------------------------------
          | MIDDLE NAME + EXTENSION
          |--------------------------------------------------------------------------
          */

          Row(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: AppTextField(
                  label: 'Middle Name',
                  hint: 'Middle Name',
                  controller:
                      middleNameController,
                  textInputAction:
                      TextInputAction.next,
                ),
              ),
              const SizedBox(
                width: 12,
              ),
              Expanded(
                child: AppTextField(
                  label: 'Extension',
                  hint: 'Jr.',
                  controller:
                      extensionController,
                  textInputAction:
                      TextInputAction.next,
                ),
              ),
            ],
          ),

          const SizedBox(
            height: 18,
          ),

          /*
          |--------------------------------------------------------------------------
          | EMAIL
          |--------------------------------------------------------------------------
          */

          AppTextField(
            label: 'Email Address *',
            hint: 'example@email.com',
            controller: emailController,
            keyboardType:
                TextInputType.emailAddress,
            textInputAction:
                TextInputAction.next,
            onChanged: (_) {
              setState(() {});
            },
          ),

          if (emailController
                  .text.isNotEmpty &&
              !validEmail) ...[
            const SizedBox(
              height: 6,
            ),
            const Row(
              children: [
                Icon(
                  Icons.error_outline_rounded,
                  size: 14,
                  color: AppColors.error,
                ),
                SizedBox(
                  width: 6,
                ),
                Expanded(
                  child: Text(
                    'Enter a valid email address',
                    style: TextStyle(
                      fontSize: 10,
                      color:
                          AppColors.error,
                    ),
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(
            height: 18,
          ),

          /*
          |--------------------------------------------------------------------------
          | PASSWORD
          |--------------------------------------------------------------------------
          */

          AppTextField(
            label: 'Set Password *',
            hint: 'Enter your password',
            controller:
                passwordController,
            obscureText: hidePassword,
            textInputAction:
                TextInputAction.next,
            onChanged: (_) {
              setState(() {});
            },
            suffixIcon: IconButton(
              onPressed: () {
                setState(() {
                  hidePassword =
                      !hidePassword;
                });
              },
              icon: Icon(
                hidePassword
                    ? Icons
                        .visibility_off_outlined
                    : Icons
                        .visibility_outlined,
              ),
            ),
          ),

          const SizedBox(
            height: 10,
          ),

          _PasswordRequirement(
            passed: hasMinimumLength,
            text: 'At least 8 characters',
          ),

          _PasswordRequirement(
            passed: hasUppercase,
            text:
                'At least one uppercase letter',
          ),

          _PasswordRequirement(
            passed:
                hasSpecialCharacter,
            text:
                'At least one special character',
          ),

          const SizedBox(
            height: 18,
          ),

          /*
          |--------------------------------------------------------------------------
          | CONFIRM PASSWORD
          |--------------------------------------------------------------------------
          */

          AppTextField(
            label: 'Confirm Password *',
            hint:
                'Confirm your password',
            controller:
                confirmPasswordController,
            obscureText:
                hideConfirmPassword,
            textInputAction:
                TextInputAction.done,
            onChanged: (_) {
              setState(() {});
            },
            suffixIcon: IconButton(
              onPressed: () {
                setState(() {
                  hideConfirmPassword =
                      !hideConfirmPassword;
                });
              },
              icon: Icon(
                hideConfirmPassword
                    ? Icons
                        .visibility_off_outlined
                    : Icons
                        .visibility_outlined,
              ),
            ),
          ),

          if (confirmPasswordController
              .text.isNotEmpty) ...[
            const SizedBox(
              height: 7,
            ),
            Row(
              children: [
                Icon(
                  passwordsMatch
                      ? Icons
                          .check_circle_rounded
                      : Icons
                          .cancel_rounded,
                  size: 15,
                  color: passwordsMatch
                      ? AppColors.success
                      : AppColors.error,
                ),
                const SizedBox(
                  width: 6,
                ),
                Expanded(
                  child: Text(
                    passwordsMatch
                        ? 'Passwords match'
                        : 'Passwords do not match',
                    style: TextStyle(
                      fontSize: 11,
                      color:
                          passwordsMatch
                              ? AppColors
                                  .success
                              : AppColors
                                  .error,
                    ),
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(
            height: 26,
          ),

          /*
          |--------------------------------------------------------------------------
          | REFERENCE PHOTO
          |--------------------------------------------------------------------------
          */

          const Text(
            'Reference Photo *',
            style: TextStyle(
              fontSize: 14,
              fontWeight:
                  FontWeight.w600,
              color:
                  AppColors.textPrimary,
            ),
          ),

          const SizedBox(
            height: 5,
          ),

          const Text(
            'Upload a clear photo containing exactly one visible face.',
            style: TextStyle(
              fontSize: 11,
              height: 1.4,
              color:
                  AppColors.textSecondary,
            ),
          ),

          const SizedBox(
            height: 10,
          ),

          InkWell(
            onTap:
                validatingPhoto ||
                        registering
                    ? null
                    : pickProfilePhoto,
            borderRadius:
                BorderRadius.circular(
              16,
            ),
            child: AnimatedContainer(
              duration: const Duration(
                milliseconds: 180,
              ),
              width: double.infinity,
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 22,
              ),
              decoration:
                  BoxDecoration(
                color: Colors.white,
                borderRadius:
                    BorderRadius.circular(
                  16,
                ),
                border: Border.all(
                  color: facePhotoValid
                      ? AppColors.success
                      : AppColors.gold,
                  width: 1.3,
                ),
              ),
              child: Column(
                children: [
                  if (validatingPhoto)
                    const SizedBox(
                      width: 40,
                      height: 40,
                      child:
                          CircularProgressIndicator(
                        strokeWidth: 3,
                        color:
                            AppColors.navy,
                      ),
                    )
                  else
                    Container(
                      width: 54,
                      height: 54,
                      decoration:
                          BoxDecoration(
                        shape:
                            BoxShape.circle,
                        color: facePhotoValid
                            ? AppColors
                                .success
                                .withValues(
                                alpha:
                                    0.10,
                              )
                            : AppColors
                                .navy
                                .withValues(
                                alpha:
                                    0.07,
                              ),
                      ),
                      child: Icon(
                        facePhotoValid
                            ? Icons
                                .check_rounded
                            : Icons
                                .add_a_photo_outlined,
                        size: 31,
                        color:
                            facePhotoValid
                                ? AppColors
                                    .success
                                : AppColors
                                    .navy,
                      ),
                    ),

                  const SizedBox(
                    height: 11,
                  ),

                  Text(
                    profilePhoto?.name ??
                        'Upload Reference Photo',
                    textAlign:
                        TextAlign.center,
                    maxLines: 2,
                    overflow:
                        TextOverflow.ellipsis,
                    style:
                        const TextStyle(
                      fontSize: 13,
                      fontWeight:
                          FontWeight.w600,
                      color: AppColors
                          .textPrimary,
                    ),
                  ),

                  const SizedBox(
                    height: 5,
                  ),

                  Text(
                    validatingPhoto
                        ? 'Checking image...'
                        : photoValidationMessage ??
                            'JPG, JPEG, PNG or HEIC',
                    textAlign:
                        TextAlign.center,
                    style:
                        TextStyle(
                      fontSize: 11,
                      height: 1.4,
                      color: facePhotoValid
                          ? AppColors.success
                          : AppColors
                              .textSecondary,
                    ),
                  ),

                  if (profilePhoto !=
                          null &&
                      !validatingPhoto) ...[
                    const SizedBox(
                      height: 9,
                    ),
                    TextButton.icon(
                      onPressed:
                          registering
                              ? null
                              : removeProfilePhoto,
                      icon: const Icon(
                        Icons
                            .delete_outline_rounded,
                        size: 16,
                      ),
                      label:
                          const Text(
                        'Remove photo',
                      ),
                      style:
                          TextButton.styleFrom(
                        foregroundColor:
                            AppColors.error,
                        visualDensity:
                            VisualDensity
                                .compact,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(
            height: 22,
          ),

          /*
          |--------------------------------------------------------------------------
          | FORM 5
          |--------------------------------------------------------------------------
          */

          const Text(
            'Form 5 Document *',
            style: TextStyle(
              fontSize: 14,
              fontWeight:
                  FontWeight.w600,
            ),
          ),

          const SizedBox(
            height: 5,
          ),

          const Text(
            'Upload your current Form 5 for student information verification.',
            style: TextStyle(
              fontSize: 11,
              height: 1.4,
              color:
                  AppColors.textSecondary,
            ),
          ),

          const SizedBox(
            height: 10,
          ),

          InkWell(
            onTap: registering
                ? null
                : pickForm5,
            borderRadius:
                BorderRadius.circular(
              16,
            ),
            child: AnimatedContainer(
              duration: const Duration(
                milliseconds: 180,
              ),
              width: double.infinity,
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 24,
              ),
              decoration:
                  BoxDecoration(
                color: Colors.white,
                borderRadius:
                    BorderRadius.circular(
                  16,
                ),
                border: Border.all(
                  color: form5 != null
                      ? AppColors.success
                      : AppColors.gold,
                  width: 1.3,
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration:
                        BoxDecoration(
                      shape:
                          BoxShape.circle,
                      color: form5 != null
                          ? AppColors.success
                              .withValues(
                              alpha: 0.10,
                            )
                          : AppColors.navy
                              .withValues(
                              alpha: 0.07,
                            ),
                    ),
                    child: Icon(
                      form5 != null
                          ? Icons
                              .check_rounded
                          : Icons
                              .upload_file_outlined,
                      size: 31,
                      color: form5 != null
                          ? AppColors.success
                          : AppColors.navy,
                    ),
                  ),

                  const SizedBox(
                    height: 10,
                  ),

                  Text(
                    form5?.name ??
                        'Upload your Form 5',
                    textAlign:
                        TextAlign.center,
                    maxLines: 2,
                    overflow:
                        TextOverflow.ellipsis,
                    style:
                        const TextStyle(
                      fontSize: 13,
                      fontWeight:
                          FontWeight.w600,
                    ),
                  ),

                  const SizedBox(
                    height: 4,
                  ),

                  const Text(
                    'PDF only • Maximum 10 MB',
                    style: TextStyle(
                      fontSize: 10,
                      color:
                          AppColors.textMuted,
                    ),
                  ),

                  if (form5 != null) ...[
                    const SizedBox(
                      height: 9,
                    ),
                    TextButton.icon(
                      onPressed:
                          registering
                              ? null
                              : removeForm5,
                      icon: const Icon(
                        Icons
                            .delete_outline_rounded,
                        size: 16,
                      ),
                      label:
                          const Text(
                        'Remove Form 5',
                      ),
                      style:
                          TextButton.styleFrom(
                        foregroundColor:
                            AppColors.error,
                        visualDensity:
                            VisualDensity
                                .compact,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(
            height: 30,
          ),

          /*
          |--------------------------------------------------------------------------
          | REGISTER
          |--------------------------------------------------------------------------
          */

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: canRegister
                  ? submitRegistration
                  : null,
              child: registering
                  ? const SizedBox(
                      width: 23,
                      height: 23,
                      child:
                          CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color:
                            Colors.white,
                      ),
                    )
                  : const Text(
                      'Create Student Account',
                    ),
            ),
          ),

          const SizedBox(
            height: 15,
          ),

          const Center(
            child: Padding(
              padding:
                  EdgeInsets.symmetric(
                horizontal: 20,
              ),
              child: Text(
                'Your information, Form 5 and reference photo will be verified before your account is fully activated.',
                textAlign:
                    TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  height: 1.5,
                  color:
                      AppColors.textMuted,
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

class _PasswordRequirement
    extends StatelessWidget {
  final bool passed;

  final String text;

  const _PasswordRequirement({
    required this.passed,
    required this.text,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    return Padding(
      padding:
          const EdgeInsets.only(
        bottom: 5,
      ),
      child: Row(
        children: [
          Icon(
            passed
                ? Icons
                    .check_circle_rounded
                : Icons
                    .circle_outlined,
            size: 14,
            color: passed
                ? AppColors.success
                : AppColors.textMuted,
          ),
          const SizedBox(
            width: 7,
          ),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 10,
                color: passed
                    ? AppColors.success
                    : AppColors
                        .textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}