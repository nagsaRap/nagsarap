<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\Student;
use App\Models\User;
use App\Services\FaceService;
use App\Services\Form5VerificationService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use RuntimeException;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function __construct(
        private readonly Form5VerificationService $form5Service,
        private readonly FaceService $faceService,
    ) {}

    public function create(array $input): User
    {
        Validator::make($input, [
            'student_number' => ['required', 'string', 'max:20', Rule::unique(Student::class, 'student_number')],
            'surname' => ['required', 'string', 'max:100'],
            'firstname' => ['required', 'string', 'max:100'],
            'middlename' => ['nullable', 'string', 'max:100'],
            'ext' => ['nullable', 'string', 'max:10'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class, 'email')],
            'password' => $this->passwordRules(),
            'profile_photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5048'],
            'form_5' => [
                'required', 'file', 'max:10240',
                'mimetypes:application/pdf,application/x-pdf,application/acrobat,applications/vnd.pdf,text/pdf,text/x-pdf,application/octet-stream',
            ],
        ])->validate();

        $photoPath = $input['profile_photo']->store('profile_photos', 'private');
        $pdfPath = $input['form_5']->store('form_5_documents', 'private');
        $pdfAbsolutePath = Storage::disk('private')->path($pdfPath);

        try {
            $photoEmbedding = $this->faceService->extractEmbeddingFromUploadedFile($input['profile_photo']);
        } catch (RuntimeException $e) {
            Storage::disk('private')->delete($photoPath);
            Storage::disk('private')->delete($pdfPath);

            throw ValidationException::withMessages([
                'profile_photo' => 'Profile Photo Error: '.$e->getMessage(),
            ]);
        }

        $expectedFullName = implode(' ', array_filter([
            $input['firstname'],
            $input['middlename'] ?? null,
            $input['surname'],
            $input['ext'] ?? null,
        ]));

        $verificationResult = $this->form5Service->verifyAndExtract(
            $pdfAbsolutePath,
            $input['student_number'],
            $expectedFullName,
        );

        if (!$verificationResult['is_verified']) {
            Storage::disk('private')->delete($photoPath);
            Storage::disk('private')->delete($pdfPath);

            throw ValidationException::withMessages([
                'form_5' => !$verificationResult['is_latest_term']
                    ? 'The uploaded Form 5 is not valid for the current academic year/semester.'
                    : 'Form 5 verification failed. Ensure it contains your correct name and student number.',
            ]);
        }

        $extractedData = $verificationResult['data'];

        $student = Student::create([
            'student_number' => $input['student_number'],
            'surname' => $input['surname'],
            'firstname' => $input['firstname'],
            'middlename' => $input['middlename'] ?? null,
            'ext' => $input['ext'] ?? null,
            'email' => $input['email'],
            'face_photo_path' => $photoPath,
            'form_5_path' => $pdfPath,
            'face_embedding' => $photoEmbedding,
            'degree' => $extractedData['degree'] ?? null,
            'year_section' => $extractedData['year_section'] ?? null,
            'semester' => $extractedData['semester'] ?? null,
            'academic_year' => $extractedData['academic_year'] ?? null,
            'verification_status' => 'pending_face_verification',
        ]);

        return User::create([
            'name' => "{$student->firstname} {$student->surname}",
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'student_id' => $student->student_id,
            'role' => 'student',
        ]);
    }
}
