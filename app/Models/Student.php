<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';

    protected $primaryKey = 'student_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'student_number',
        'surname',
        'firstname',
        'middlename',
        'ext',
        'email',
        'degree_id',
        'curricula_id',
        'entrance_status',
        'rfid',

        // Form 5 Parsed Metadata Fields
        'degree',
        'year_section',
        'semester',
        'academic_year',

        // OCR & Facial Liveness Verification Fields
        'form_5_path',
        'face_photo_path',
        'face_embedding', // <--- Added for facial keypoint vectors
        'verification_status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'face_embedding' => 'array', // <--- Automatically converts JSON to PHP array and vice-versa
    ];

    /**
     * Get the user account associated with the student profile.
     */
    public function user(): HasOne
    {
        return $this->hasOne(
            User::class,
            'student_id', // Foreign key on users table
            'student_id'  // Local key on students table
        );
    }
}