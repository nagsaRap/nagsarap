import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/verification_service.dart';
import 'liveness_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  static const navy = Color(0xFF08086B);
  static const gold = Color(0xFFFFA000);
  static const green = Color(0xFF14A44D);
  static const red = Color(0xFFE53935);

  final _formKey = GlobalKey<FormState>();
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final studentNo = TextEditingController();
  final email = TextEditingController();
  final program = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();

  final picker = ImagePicker();
  final VerificationService verificationService = MockVerificationService();

  String? uploadedPhotoPath;
  String? livePhotoPath;
  bool checkingLiveness = false;
  bool checkingMatch = false;
  bool livenessPassed = false;
  bool faceMatched = false;
  bool submitting = false;

  bool get identityVerified =>
      uploadedPhotoPath != null && livenessPassed && faceMatched;

  Future<void> pickReferencePhoto() async {
    final image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
      maxWidth: 1600,
    );
    if (image == null) return;

    setState(() {
      uploadedPhotoPath = image.path;
      livePhotoPath = null;
      livenessPassed = false;
      faceMatched = false;
    });
  }

  Future<void> startLiveness() async {
    if (uploadedPhotoPath == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Upload a face photo first.')),
      );
      return;
    }

    final result = await Navigator.push<LivenessCaptureResult>(
      context,
      MaterialPageRoute(builder: (_) => const LivenessScreen()),
    );
    if (result == null || !mounted) return;

    setState(() {
      livePhotoPath = result.liveImagePath;
      checkingLiveness = true;
      livenessPassed = false;
      faceMatched = false;
    });

    final liveResult = await verificationService.verifyLiveness(
      liveImagePath: result.liveImagePath,
    );
    if (!mounted) return;

    setState(() {
      checkingLiveness = false;
      livenessPassed = liveResult.passed;
    });

    if (!liveResult.passed) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(liveResult.message)),
      );
      return;
    }

    setState(() => checkingMatch = true);

    final matchResult = await verificationService.compareFaces(
      uploadedImagePath: uploadedPhotoPath!,
      liveImagePath: livePhotoPath!,
    );
    if (!mounted) return;

    setState(() {
      checkingMatch = false;
      faceMatched = matchResult.matched;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(matchResult.message)),
    );
  }

  Future<void> register() async {
    if (!_formKey.currentState!.validate()) return;
    if (!identityVerified) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Complete identity verification first.'),
        ),
      );
      return;
    }

    setState(() => submitting = true);

    // LATER: replace this with Laravel API POST.
    await Future.delayed(const Duration(milliseconds: 900));

    if (!mounted) return;
    setState(() => submitting = false);

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(22),
        ),
        icon: const Icon(Icons.check_circle, color: green, size: 52),
        title: const Text('Registration ready'),
        content: const Text(
          'The UI flow is complete. Connect this final step to Laravel later.',
          textAlign: TextAlign.center,
        ),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Back to Login'),
          )
        ],
      ),
    );
  }

  String? requiredField(String? value) =>
      value == null || value.trim().isEmpty ? 'Required' : null;

  @override
  void dispose() {
    firstName.dispose();
    lastName.dispose();
    studentNo.dispose();
    email.dispose();
    program.dispose();
    password.dispose();
    confirmPassword.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F4F7),
      appBar: AppBar(
        title: const Text(
          'Create Account',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _hero(),
              const SizedBox(height: 18),
              _sectionTitle(
                Icons.person_outline,
                'Student Information',
                'Use your official university information.',
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _field(
                      'First Name',
                      firstName,
                      validator: requiredField,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _field(
                      'Last Name',
                      lastName,
                      validator: requiredField,
                    ),
                  ),
                ],
              ),
              _field(
                'Student Number',
                studentNo,
                hint: '23-140023',
                validator: requiredField,
              ),
              _field(
                'Email Address',
                email,
                hint: 'student@mmsu.edu.ph',
                validator: (v) {
                  if (requiredField(v) != null) return 'Required';
                  if (!v!.contains('@')) return 'Enter a valid email';
                  return null;
                },
              ),
              _field(
                'Program / Section',
                program,
                hint: 'BSCS 4A',
                validator: requiredField,
              ),
              _field(
                'Password',
                password,
                obscure: true,
                validator: (v) {
                  if (requiredField(v) != null) return 'Required';
                  if (v!.length < 8) return 'Use at least 8 characters';
                  return null;
                },
              ),
              _field(
                'Confirm Password',
                confirmPassword,
                obscure: true,
                validator: (v) {
                  if (requiredField(v) != null) return 'Required';
                  if (v != password.text) return 'Passwords do not match';
                  return null;
                },
              ),
              const SizedBox(height: 18),
              _sectionTitle(
                Icons.verified_user_outlined,
                'Identity Verification',
                'The uploaded photo must match the person completing the live camera check.',
              ),
              const SizedBox(height: 10),
              _verificationCard(
                number: 1,
                title: 'Upload Face Photo',
                subtitle:
                    'Choose a clear, recent, front-facing JPG or PNG image.',
                complete: uploadedPhotoPath != null,
                child: uploadedPhotoPath == null
                    ? InkWell(
                        onTap: pickReferencePhoto,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          height: 150,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8F8FB),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: const Color(0xFFD8D8E0),
                            ),
                          ),
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircleAvatar(
                                backgroundColor: Color(0xFFFFE8A3),
                                child: Icon(Icons.add_a_photo, color: navy),
                              ),
                              SizedBox(height: 8),
                              Text(
                                'Choose Face Photo',
                                style: TextStyle(fontWeight: FontWeight.w900),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Tap to choose from gallery',
                                style: TextStyle(
                                  color: Colors.black54,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : Column(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: Image.file(
                              File(uploadedPhotoPath!),
                              height: 190,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(
                                Icons.check_circle,
                                color: green,
                                size: 18,
                              ),
                              const SizedBox(width: 5),
                              const Expanded(
                                child: Text(
                                  'Reference photo uploaded',
                                  style: TextStyle(
                                    color: green,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                              TextButton.icon(
                                onPressed: pickReferencePhoto,
                                icon: const Icon(Icons.refresh, size: 17),
                                label: const Text('Replace'),
                              ),
                            ],
                          )
                        ],
                      ),
              ),
              const SizedBox(height: 12),
              _verificationCard(
                number: 2,
                title: 'Liveness Check',
                subtitle:
                    'Open the front camera and complete the guided live-face flow.',
                complete: livenessPassed,
                loading: checkingLiveness,
                child: Column(
                  children: [
                    if (livePhotoPath != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.file(
                          File(livePhotoPath!),
                          height: 120,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                    if (livePhotoPath != null) const SizedBox(height: 10),
                    if (checkingLiveness)
                      const Column(
                        children: [
                          LinearProgressIndicator(color: gold),
                          SizedBox(height: 8),
                          Text(
                            'Checking liveness...',
                            style: TextStyle(fontSize: 10),
                          ),
                        ],
                      ),
                    if (!checkingLiveness)
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed:
                              uploadedPhotoPath == null ? null : startLiveness,
                          icon: const Icon(Icons.face_retouching_natural),
                          label: Text(
                            livenessPassed
                                ? 'Repeat Liveness Check'
                                : 'Start Liveness Check',
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              _verificationCard(
                number: 3,
                title: 'Face Match',
                subtitle:
                    'The uploaded reference photo is compared with the live capture.',
                complete: faceMatched,
                loading: checkingMatch,
                failed: livenessPassed && !checkingMatch && !faceMatched,
                child: checkingMatch
                    ? const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LinearProgressIndicator(color: gold),
                          SizedBox(height: 8),
                          Text(
                            'Comparing uploaded image and live capture...',
                            style: TextStyle(fontSize: 10),
                          )
                        ],
                      )
                    : faceMatched
                        ? _statusBox(
                            green,
                            Icons.verified,
                            'Identity verified',
                            'The face-match stage passed.',
                          )
                        : _statusBox(
                            Colors.black54,
                            Icons.lock_outline,
                            'Waiting for verification',
                            'Complete the liveness step first.',
                          ),
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(13),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF9E7),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFFD66B)),
                ),
                child: const Text(
                  'UI READY: real image selection and real camera capture are enabled. '
                  'The current liveness and face-match results are mock placeholders until your AI/backend service is connected.',
                  style: TextStyle(fontSize: 10.5, height: 1.35),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 54,
                child: FilledButton.icon(
                  onPressed: identityVerified && !submitting ? register : null,
                  style: FilledButton.styleFrom(
                    backgroundColor: navy,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  icon: submitting
                      ? const SizedBox(
                          width: 17,
                          height: 17,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Icon(
                          identityVerified
                              ? Icons.how_to_reg
                              : Icons.lock_outline,
                        ),
                  label: Text(
                    submitting
                        ? 'Preparing...'
                        : identityVerified
                            ? 'Register Account'
                            : 'Complete Identity Verification',
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _hero() => Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF050547), navy],
          ),
          borderRadius: BorderRadius.circular(22),
        ),
        child: const Row(
          children: [
            CircleAvatar(
              radius: 27,
              backgroundColor: gold,
              child: Icon(Icons.security, color: navy, size: 28),
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Secure Student Registration',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Create your account and complete identity verification.',
                    style: TextStyle(
                      color: Color(0xFFDCDCF5),
                      fontSize: 10.5,
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      );

  Widget _sectionTitle(IconData icon, String title, String subtitle) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: navy),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Colors.black54,
                    fontSize: 10.5,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      );

  Widget _field(
    String label,
    TextEditingController controller, {
    String? hint,
    bool obscure = false,
    String? Function(String?)? validator,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 10.5,
              ),
            ),
            const SizedBox(height: 5),
            TextFormField(
              controller: controller,
              obscureText: obscure,
              validator: validator,
              decoration: InputDecoration(
                hintText: hint,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(
                    color: Color(0xFFD8D8E0),
                  ),
                ),
              ),
            ),
          ],
        ),
      );

  Widget _verificationCard({
    required int number,
    required String title,
    required String subtitle,
    required bool complete,
    required Widget child,
    bool loading = false,
    bool failed = false,
  }) {
    Color color = navy;
    if (complete) color = green;
    if (failed) color = red;
    if (loading) color = gold;

    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(19),
        border: Border.all(color: color.withOpacity(.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 17,
                backgroundColor: color.withOpacity(.12),
                child: complete
                    ? Icon(Icons.check, color: color, size: 19)
                    : loading
                        ? const SizedBox(
                            width: 15,
                            height: 15,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: gold,
                            ),
                          )
                        : Text(
                            '$number',
                            style: TextStyle(
                              color: color,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: Colors.black54,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  static Widget _statusBox(
    Color color,
    IconData icon,
    String title,
    String subtitle,
  ) =>
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(.08),
          borderRadius: BorderRadius.circular(13),
        ),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.w900,
                      fontSize: 11,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 9.5),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
