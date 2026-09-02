<?php

use App\Services\GeofenceService;

test('same coordinate is inside geofence', function () {
    $service = app(GeofenceService::class);
    $result = $service->check(18.061, 120.519, 18.061, 120.519, 100);

    expect($result['inside'])->toBeTrue();
    expect($result['distance'])->toBe(0.0);
});

test('far coordinate is outside small geofence', function () {
    $service = app(GeofenceService::class);
    $result = $service->check(18.061, 120.519, 18.063, 120.519, 50);

    expect($result['inside'])->toBeFalse();
    expect($result['distance'])->toBeGreaterThan(50);
});
