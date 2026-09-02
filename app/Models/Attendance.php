<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $primaryKey = 'attendance_id';

    protected $fillable = [
        'student_id',
        'event_id',
        'logged_at',
        'status',
        'confidence_score',
    
        'latitude',
        'longitude',
        'location_accuracy',
        'distance_from_event',
        'location_verified_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'location_accuracy' => 'float',
        'distance_from_event' => 'float',
        'location_verified_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }
}