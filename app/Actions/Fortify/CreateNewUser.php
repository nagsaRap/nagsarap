<?php

namespace App\Actions\Fortify;

use App\Models\Student;
use App\Models\User;
use App\Services\Form5VerificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Illuminate\Validation\Rules\Password;

class CreateNewUser implements CreatesNewUsers
{
    public function __construct(
        protected Form5VerificationService $form5Verifier
    ) {}

    /**
     * Create a new user and student record following Form 5 verification.
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'student_number' => [
                'required',
                'string',
                'max:15',
                'unique:students,student_number',
            ],
            'surname'    => ['required', 'string', 'max:30'],
            'firstname'  => ['required', 'string', 'max:30'],
            'middlename' => ['nullable', 'string', 'max:30'],
            'ext'        => ['nullable', 'string', 'max:10'],
            'email'      => [
                'required',
                'string',
                'email',
                'max:100',
                'unique:users,email',
            ],
            'password'   => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers(),
            ],
            // Face Photo Validation
            'face_photo'     => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'], // Max 5MB
            'face_embedding' => ['required', 'json'],                                     // Validated JSON keypoints array

            // Form 5 Validation
            'form_5'     => [
                'required',
                'file',
                'max:10240', // Max 10MB
                function ($attribute, $value, $fail) {
                    if ($value && strtolower($value->getClientOriginalExtension()) !== 'pdf') {
                        $fail('The ' . $attribute . ' field must be a file of type: pdf.');
                    }
                },
            ],
        ])->validate();

        // 1. Save uploaded files temporarily
        $tempPdfPath = $input['form_5']->storeAs(
            'temp',
            uniqid('form5_') . '.pdf',
            'local'
        );

        $facePhotoPath = $input['face_photo']->store('face_references', 'private');

        // Resolve exact full path on disk
        $fullPdfPath = Storage::disk('local')->path($tempPdfPath);

        // Include middlename and surname so all parts are sent to matching
        $fullNameParts = array_filter([
            $input['firstname'],
            $input['middlename'] ?? null,
            $input['surname'],
            $input['ext'] ?? null,
        ]);
        $fullName = implode(' ', $fullNameParts);

        // 2. Perform Verification and Extract Metadata via Service
        $verificationResult = $this->form5Verifier->verifyAndExtract(
            $fullPdfPath,
            $input['student_number'],
            $fullName
        );

        // 3. Reject & Cleanup if Verification or Term Check Fails
        if (!$verificationResult['is_verified']) {
            Storage::disk('local')->delete($tempPdfPath);
            Storage::disk('private')->delete($facePhotoPath);

            // Explicit rejection message if the Form 5 is outdated
            if (isset($verificationResult['is_latest_term']) && !$verificationResult['is_latest_term']) {
                throw ValidationException::withMessages([
                    'form_5' => 'Outdated Form 5 detected. Please upload your document for the current academic term.',
                ]);
            }

            // Default rejection message for student ID or name mismatches
            throw ValidationException::withMessages([
                'form_5' => 'Form 5 verification failed. Details on the document do not match your input.',
            ]);
        }

        $extractedData = $verificationResult['data'];

        // 4. Move Form 5 PDF to permanent secure storage upon success
        $permanentForm5Path = 'form_5/' . basename($tempPdfPath);
        Storage::disk('private')->move($tempPdfPath, $permanentForm5Path);

        // Decode JSON keypoints string into PHP array
        $embeddingArray = json_decode($input['face_embedding'], true);

        // 5. Save Records in Database Transaction
        return DB::transaction(function () use ($input, $permanentForm5Path, $facePhotoPath, $extractedData, $embeddingArray) {
            $student = Student::create([
                'student_number'      => $input['student_number'],
                'surname'             => $input['surname'],
                'firstname'           => $input['firstname'],
                'middlename'          => $input['middlename'] ?? null,
                'ext'                 => $input['ext'] ?? null,
                'email'               => $input['email'],
                'degree'              => $extractedData['degree'] ?? null,
                'year_section'        => $extractedData['year_section'] ?? null,
                'semester'            => $extractedData['semester'] ?? null,
                'academic_year'       => $extractedData['academic_year'] ?? null,
                'form_5_path'         => $permanentForm5Path,
                'face_photo_path'     => $facePhotoPath,
                'face_embedding'      => $embeddingArray,              // Stores array (cast to JSON in Student model)
                'verification_status' => 'pending_verification',     // Requires Step 2 live webcam check
            ]);

            return User::create([
                'student_id' => $student->student_id,
                'name'       => trim($student->firstname . ' ' . $student->surname),
                'email'      => $student->email,
                'password'   => $input['password'],
                'role'       => 'student',
            ]);
        });
    }
}