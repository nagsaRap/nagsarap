<?php

return [
    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'face' => [
        'url' => env('FACE_SERVICE_URL', 'http://127.0.0.1:5000'),
        'match_threshold' => (float) env('FACE_MATCH_THRESHOLD', 0.60),
        'enrollment_threshold' => (float) env('FACE_ENROLLMENT_THRESHOLD', 0.50),
    ],

    'geofence' => [
        'max_accuracy_meters' => (float) env('MAX_GPS_ACCURACY_METERS', 100),
    ],
];
