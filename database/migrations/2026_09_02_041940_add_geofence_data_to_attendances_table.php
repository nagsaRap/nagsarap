<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->decimal('location_accuracy', 8, 2)->nullable();

            $table->decimal('distance_from_event', 10, 2)->nullable();

            $table->timestamp('location_verified_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'location_accuracy',
                'distance_from_event',
                'location_verified_at',
            ]);
        });
    }
};