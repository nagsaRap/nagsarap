<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
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

        'verification_status',
        'face_photo_path',
        'face_embedding',
    ];

    protected $hidden = [
    'face_embedding',
    'face_photo_path',
];

    protected $casts = [
        'student_id' => 'integer',
        'degree_id' => 'integer',
        'curricula_id' => 'integer',
        'entrance_status' => 'integer',

        /*
         * If face_embedding is stored as JSON
         * in your database, Laravel will
         * automatically convert it to array.
         */
        'face_embedding' => 'array',
    ];

    /**
     * Student's user/login account.
     *
     * This assumes users.student_id points to
     * students.student_id.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'student_id',
            'student_id'
        );
    }

    /**
     * Attendance records belonging to student.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(
            Attendance::class,
            'student_id',
            'student_id'
        );
    }
}