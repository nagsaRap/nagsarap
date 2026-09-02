<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    'is_active',
];
    protected $casts = [
        'event_date' => 'date',
        'latitude' => 'float',
        'longitude' => 'float',
        'geofence_radius' => 'integer',
        'geofence_enabled' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'event_id', 'event_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'attendances', 'event_id', 'student_id')
            ->withPivot('status', 'confidence_score', 'logged_at')
            ->withTimestamps();
    }
}