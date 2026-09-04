<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\Student;
use App\Models\User;
use App\Services\FaceService;
use App\Services\Form5VerificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use RuntimeException;
use Throwable;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function __construct(
        private readonly Form5VerificationService $form5Service,
        private readonly FaceService $faceService,
    ) {}

    public function create(array $input): User
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Validate registration data
        |--------------------------------------------------------------------------
        */

        Validator::make(
            $input,
            [
                'student_number' => [
                    'required',
                    'string',
                    'max:20',

                    // Format: 23-140012
                    // 23 = year
                    // 14 = college
                    // 0012 = sequence
                    'regex:/^\d{2}-\d{6}$/',

                    Rule::unique('students', 'student_number'),
                ],

                'surname' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'firstname' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'middlename' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'ext' => [
                    'nullable',
                    'string',
                    'max:10',
                ],

                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email'),
                    Rule::unique('students', 'email'),
                ],

                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',

                    // At least one uppercase letter
                    'regex:/[A-Z]/',

                    // At least one special character
                    'regex:/[^A-Za-z0-9]/',
                ],

                'profile_photo' => [
                    'required',
                    'file',
                    'image',
                    'mimes:jpeg,jpg,png',
                    'max:5048',
                ],

                /*
                 * Do NOT depend on MIME detection for Form 5.
                 *
                 * Some valid PDFs from macOS/browser uploads can be
                 * detected as application/octet-stream.
                 *
                 * We validate the actual PDF signature below.
                 */
                'form_5' => [
                    'required',
                    'file',
                    'max:10240',
                ],
            ],
            [
                'student_number.regex' =>
                    'Student number must follow the format 23-140012.',

                'password.min' =>
                    'Password must contain at least 8 characters.',

                'password.regex' =>
                    'Password must contain an uppercase letter and a special character.',
            ]
        )->validate();

        /*
        |--------------------------------------------------------------------------
        | 2. Normalize student number
        |--------------------------------------------------------------------------
        */

        $studentNumber = trim($input['student_number']);

        /*
        |--------------------------------------------------------------------------
        | 3. Extract information from student number
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | 23-140012
        |
        | 23   = year code
        | 14   = college code
        | 0012 = student sequence
        |
        */

        if (!preg_match(
            '/^(\d{2})-(\d{2})(\d{4})$/',
            $studentNumber,
            $matches
        )) {
            throw ValidationException::withMessages([
                'student_number' =>
                    'Invalid student number. Expected format: 23-140012.',
            ]);
        }

        $yearCode = $matches[1];
        $collegeCode = $matches[2];
        $studentSequence = $matches[3];

        /*
        |--------------------------------------------------------------------------
        | 4. College mapping
        |--------------------------------------------------------------------------
        |
        | Add more colleges here later without changing the registration UI.
        |
        */

        $collegeMap = [
            '14' => 'CCIS',

            // Future examples:
            // '11' => 'College Name',
            // '12' => 'College Name',
            // '13' => 'College Name',
        ];

        if (!array_key_exists($collegeCode, $collegeMap)) {
            throw ValidationException::withMessages([
                'student_number' =>
                    "College code {$collegeCode} from the student number is not recognized.",
            ]);
        }

        $college = $collegeMap[$collegeCode];

        /*
        |--------------------------------------------------------------------------
        | 5. Validate the actual Form 5 file
        |--------------------------------------------------------------------------
        |
        | We inspect the PDF signature instead of trusting browser MIME type.
        |
        */

        $form5File = $input['form_5'];

        $temporaryPdfPath = $form5File->getRealPath();

        if (
            !$temporaryPdfPath ||
            !is_file($temporaryPdfPath)
        ) {
            throw ValidationException::withMessages([
                'form_5' =>
                    'Unable to read the uploaded Form 5.',
            ]);
        }

        $handle = fopen($temporaryPdfPath, 'rb');

        if ($handle === false) {
            throw ValidationException::withMessages([
                'form_5' =>
                    'Unable to open the uploaded Form 5.',
            ]);
        }

        /*
         * Read enough bytes to tolerate a BOM or small amount
         * of metadata before %PDF-.
         */
        $header = fread($handle, 4096);

        fclose($handle);

        if (
            $header === false ||
            strpos($header, '%PDF-') === false
        ) {
            throw ValidationException::withMessages([
                'form_5' =>
                    'The uploaded Form 5 is not a valid PDF document.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 6. Verify reference face before DB creation
        |--------------------------------------------------------------------------
        */

        try {
            $photoEmbedding =
                $this->faceService
                    ->extractEmbeddingFromUploadedFile(
                        $input['profile_photo']
                    );
        } catch (RuntimeException $e) {
            throw ValidationException::withMessages([
                'profile_photo' =>
                    'Reference Photo Error: '.$e->getMessage(),
            ]);
        }

        if (
            !is_array($photoEmbedding) ||
            count($photoEmbedding) < 100
        ) {
            throw ValidationException::withMessages([
                'profile_photo' =>
                    'Unable to generate a valid face embedding from the reference photo.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 7. Store files privately
        |--------------------------------------------------------------------------
        */

        $photoPath = null;
        $pdfPath = null;

        try {
            $photoPath =
                $input['profile_photo']->store(
                    'profile_photos',
                    'private'
                );

            $pdfPath =
                $input['form_5']->store(
                    'form_5_documents',
                    'private'
                );

            $pdfAbsolutePath =
                Storage::disk('private')->path($pdfPath);

            /*
            |--------------------------------------------------------------------------
            | 8. OCR / Form 5 verification
            |--------------------------------------------------------------------------
            */

            $expectedFullName = implode(
                ' ',
                array_filter([
                    trim($input['firstname']),
                    trim($input['middlename'] ?? ''),
                    trim($input['surname']),
                    trim($input['ext'] ?? ''),
                ])
            );

            $verificationResult =
                $this->form5Service->verifyAndExtract(
                    $pdfAbsolutePath,
                    $studentNumber,
                    $expectedFullName,
                );

            if (
                !isset($verificationResult['is_verified']) ||
                !$verificationResult['is_verified']
            ) {
                $isLatestTerm =
                    $verificationResult['is_latest_term']
                    ?? true;

                throw ValidationException::withMessages([
                    'form_5' => !$isLatestTerm
                        ? 'The uploaded Form 5 is not valid for the current academic year or semester.'
                        : 'Form 5 verification failed. Make sure the student number and name match the uploaded Form 5.',
                ]);
            }

            $extractedData =
                $verificationResult['data'] ?? [];

            /*
            |--------------------------------------------------------------------------
            | 9. Create Student + User atomically
            |--------------------------------------------------------------------------
            */

            $user = DB::transaction(
                function () use (
                    $input,
                    $studentNumber,
                    $collegeCode,
                    $college,
                    $photoPath,
                    $pdfPath,
                    $photoEmbedding,
                    $extractedData
                ) {
                    $student = Student::create([
                        'student_number' =>
                            $studentNumber,

                        'surname' =>
                            trim($input['surname']),

                        'firstname' =>
                            trim($input['firstname']),

                        'middlename' =>
                            !empty($input['middlename'])
                                ? trim($input['middlename'])
                                : null,

                        'ext' =>
                            !empty($input['ext'])
                                ? trim($input['ext'])
                                : null,

                        'email' =>
                            strtolower(trim($input['email'])),

                        /*
                         * Automatically determined from student number.
                         */
                        'college_code' =>
                            $collegeCode,

                        'college' =>
                            $college,

                        /*
                         * Data extracted from Form 5 OCR.
                         */
                        'degree' =>
                            $extractedData['degree'] ?? null,

                        'year_section' =>
                            $extractedData['year_section'] ?? null,

                        'semester' =>
                            $extractedData['semester'] ?? null,

                        'academic_year' =>
                            $extractedData['academic_year'] ?? null,

                        /*
                         * Biometric/document storage.
                         */
                        'face_photo_path' =>
                            $photoPath,

                        'form_5_path' =>
                            $pdfPath,

                        'face_embedding' =>
                            $photoEmbedding,

                        /*
                         * User still needs live liveness +
                         * face verification.
                         */
                        'verification_status' =>
                            'pending_face_verification',
                    ]);

                    return User::create([
                        'student_id' =>
                            $student->student_id,

                        'name' =>
                            trim(
                                $student->firstname.' '.
                                $student->surname
                            ),

                        'email' =>
                            strtolower(trim($input['email'])),

                        'password' =>
                            Hash::make($input['password']),

                        'role' =>
                            'student',
                    ]);
                }
            );

            /*
            |--------------------------------------------------------------------------
            | 10. Verify Student relationship
            |--------------------------------------------------------------------------
            */

            $user->load('student');

            if (!$user->student) {
                throw new RuntimeException(
                    'Student account was created but its student relationship could not be loaded.'
                );
            }

            return $user;

        } catch (ValidationException $e) {

            if ($photoPath) {
                Storage::disk('private')
                    ->delete($photoPath);
            }

            if ($pdfPath) {
                Storage::disk('private')
                    ->delete($pdfPath);
            }

            throw $e;

        } catch (Throwable $e) {

            if ($photoPath) {
                Storage::disk('private')
                    ->delete($photoPath);
            }

            if ($pdfPath) {
                Storage::disk('private')
                    ->delete($pdfPath);
            }

            report($e);

            throw ValidationException::withMessages([
                'email' =>
                    'Registration failed. Please try again.',
            ]);
        }
    }
}