<?php

namespace App\Services;

class GeofenceService
{
    /**
     * Calculate distance between two GPS points using
     * the Haversine formula.
     *
     * Returns meters.
     */
    public function distanceInMeters(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371000;

        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);

        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLon = deg2rad($lon2 - $lon1);

        $a =
            sin($deltaLat / 2) ** 2 +
            cos($lat1Rad) *
            cos($lat2Rad) *
            sin($deltaLon / 2) ** 2;

        $c = 2 * atan2(
            sqrt($a),
            sqrt(1 - $a)
        );

        return $earthRadius * $c;
    }

    public function check(
        float $studentLatitude,
        float $studentLongitude,
        float $eventLatitude,
        float $eventLongitude,
        float $allowedRadius
    ): array {
        $distance = $this->distanceInMeters(
            $studentLatitude,
            $studentLongitude,
            $eventLatitude,
            $eventLongitude
        );

        return [
            'inside' => $distance <= $allowedRadius,
            'distance' => round($distance, 2),
            'radius' => $allowedRadius,
        ];
    }
}