<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $primaryKey = 'event_id';

    protected $fillable = [
        'title',
        'description',
        'event_date',
        'start_time',
        'end_time',
        'location',
        'latitude',
        'longitude',
        'geofence_radius',
        'geofence_enabled',
        'late_after_minutes',
        'is_active',
    ];

    protected $casts = [
        'event_date' => 'date',
        'latitude' => 'float',
        'longitude' => 'float',
        'geofence_radius' => 'integer',
        'geofence_enabled' => 'boolean',
        'late_after_minutes' => 'integer',
        'is_active' => 'boolean',
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'event_id', 'event_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'attendances', 'event_id', 'student_id')
            ->withPivot('status', 'confidence_score', 'logged_at', 'attendance_time', 'sync_time')
            ->withTimestamps();
    }
}
