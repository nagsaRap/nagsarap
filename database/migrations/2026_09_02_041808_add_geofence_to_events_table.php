<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable()->after('location');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');

            $table->unsignedInteger('geofence_radius')
                ->default(100)
                ->after('longitude');

            $table->boolean('geofence_enabled')
                ->default(true)
                ->after('geofence_radius');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'geofence_radius',
                'geofence_enabled',
            ]);
        });
    }
};